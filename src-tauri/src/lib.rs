#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::panic;
use tauri::{State, Emitter};
use tokio::sync::Mutex as TokioMutex;

struct TransferState {
    child_process: Arc<TokioMutex<Option<std::process::Child>>>,
    is_running: Arc<AtomicBool>,
}

impl Default for TransferState {
    fn default() -> Self {
        Self {
            child_process: Arc::new(TokioMutex::new(None)),
            is_running: Arc::new(AtomicBool::new(false)),
        }
    }
}

#[derive(serde::Serialize, Clone)]
struct CheckResult {
    installed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    version: Option<String>,
}

#[derive(serde::Serialize, Clone)]
struct SendResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(serde::Serialize, Clone)]
struct ReceiveResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(serde::Serialize, Clone)]
struct ProgressPayload {
    progress: f64,
    speed: u64,
    transferred: u64,
    total: u64,
    file_name: String,
    remaining_time: f64,
}

#[tauri::command]
async fn check_croc_installed() -> Result<CheckResult, String> {
    let output = Command::new("croc")
        .arg("--version")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(CheckResult {
            installed: true,
            version: Some(version),
        })
    } else {
        Ok(CheckResult {
            installed: false,
            version: None,
        })
    }
}

#[tauri::command]
async fn start_send(
    state: State<'_, TransferState>,
    app_handle: tauri::AppHandle,
    files: Vec<String>,
    code: String,
    port: u16,
) -> Result<SendResult, String> {
    if files.is_empty() {
        return Ok(SendResult {
            success: false,
            code: None,
            error: Some("No files selected".to_string()),
        });
    }

    let mut child_process = state.child_process.lock().await;

    if state.is_running.load(Ordering::SeqCst) {
        return Ok(SendResult {
            success: false,
            code: None,
            error: Some("A transfer is already in progress".to_string()),
        });
    }

    let file_arg = files.join(" ");
    let args = vec![
        "send".to_string(),
        file_arg,
        "--code".to_string(),
        code.clone(),
        "--port".to_string(),
        port.to_string(),
        "--relay".to_string(),
        "https://relay.croc.house".to_string(),
    ];

    let child = Command::new("croc")
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    *child_process = Some(child);
    state.is_running.store(true, Ordering::SeqCst);

    let is_running = state.is_running.clone();
    let child_process = state.child_process.clone();
    let app_handle_clone = app_handle.clone();
    let code_clone = code.clone();

    tokio::spawn(async move {
        let mut child_guard = child_process.lock().await;
        if let Some(ref mut child) = *child_guard {
            if let Some(stdout) = child.stdout.take() {
                let reader = BufReader::new(stdout);
                for line in reader.lines() {
                    if let Ok(line) = line {
                        if line.contains("On the other computer") {
                            let _ = app_handle_clone.emit("code-generated", &code_clone);
                        }
                        parse_and_emit_progress(&line, &app_handle_clone);
                    }
                }
            }
            
            let _ = child.wait();
            is_running.store(false, Ordering::SeqCst);
            let _ = app_handle_clone.emit("transfer-completed", ());
        }
    });

    Ok(SendResult {
        success: true,
        code: Some(code),
        error: None,
    })
}

#[tauri::command]
async fn start_receive(
    state: State<'_, TransferState>,
    app_handle: tauri::AppHandle,
    code: String,
    output_dir: String,
    port: u16,
) -> Result<ReceiveResult, String> {
    let mut child_process = state.child_process.lock().await;

    if state.is_running.load(Ordering::SeqCst) {
        return Ok(ReceiveResult {
            success: false,
            error: Some("A transfer is already in progress".to_string()),
        });
    }

    let child = Command::new("croc")
        .args([
            "receive",
            &code,
            "--dir", &output_dir,
            "--port", &port.to_string(),
            "--relay", "https://relay.croc.house",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    *child_process = Some(child);
    state.is_running.store(true, Ordering::SeqCst);

    let is_running = state.is_running.clone();
    let child_process = state.child_process.clone();
    let app_handle_clone = app_handle.clone();

    tokio::spawn(async move {
        let mut child_guard = child_process.lock().await;
        if let Some(ref mut child) = *child_guard {
            if let Some(stdout) = child.stdout.take() {
                let reader = BufReader::new(stdout);
                for line in reader.lines() {
                    if let Ok(line) = line {
                        parse_and_emit_progress(&line, &app_handle_clone);
                    }
                }
            }
            
            let _ = child.wait();
            is_running.store(false, Ordering::SeqCst);
            let _ = app_handle_clone.emit("transfer-completed", ());
        }
    });

    Ok(ReceiveResult {
        success: true,
        error: None,
    })
}

#[tauri::command]
async fn stop_transfer(state: State<'_, TransferState>) -> Result<bool, String> {
    let mut child_process = state.child_process.lock().await;

    if let Some(ref mut child) = *child_process {
        child.kill().map_err(|e| e.to_string())?;
        *child_process = None;
        state.is_running.store(false, Ordering::SeqCst);
        Ok(true)
    } else {
        Ok(false)
    }
}

fn parse_and_emit_progress(line: &str, app_handle: &tauri::AppHandle) {
    let mut progress: f64 = 0.0;
    let mut speed_str = String::from("0 B/s");
    
    for word in line.split_whitespace() {
        if word.ends_with('%') {
            if let Ok(p) = word.trim_end_matches('%').parse::<f64>() {
                progress = p;
            }
        }
        if word.ends_with("/s") && (word.contains("B") || word.contains("b")) {
            speed_str = word.to_string();
        }
    }
    
    if progress > 0.0 {
        let speed = parse_speed(&speed_str);
        let file_name = extract_file_name(line);
        
        let payload = ProgressPayload {
            progress,
            speed,
            transferred: 0,
            total: 0,
            file_name,
            remaining_time: 0.0,
        };
        
        let _ = app_handle.emit("transfer-progress", payload);
    }
}

fn parse_speed(speed_str: &str) -> u64 {
    let mut value_str = String::new();
    let mut unit_str = String::new();
    let mut in_value = true;
    
    for ch in speed_str.chars() {
        if ch.is_ascii_digit() || ch == '.' {
            if in_value {
                value_str.push(ch);
            }
        } else if ch.is_alphabetic() {
            in_value = false;
            unit_str.push(ch);
        }
    }
    
    let value: f64 = value_str.parse().unwrap_or(0.0);
    
    let multiplier = match unit_str.to_uppercase().as_str() {
        "B" => 1.0,
        "KB" => 1024.0,
        "MB" => 1024.0 * 1024.0,
        "GB" => 1024.0 * 1024.0 * 1024.0,
        _ => 1.0,
    };
    
    (value * multiplier) as u64
}

fn extract_file_name(line: &str) -> String {
    for part in line.split_whitespace() {
        if part.len() > 3 && (part.starts_with("file") || part.starts_with("File")) {
            if let Some(eq_pos) = part.find('=') {
                let after_eq = &part[eq_pos + 1..];
                let name = after_eq.trim_matches(|c| c == '\'' || c == '"' || c == ',');
                if !name.is_empty() && !name.starts_with("file") {
                    return name.to_string();
                }
            }
        }
    }
    
    "传输中...".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    // 安装 panic hook，把 panic 信息写入日志文件，方便排查崩溃
    let default_panic = panic::take_hook();
    panic::set_hook(Box::new(move |panic_info| {
        let msg = format!(
            "[PANIC] {}\nBacktrace:\n{:?}\n",
            panic_info,
            std::backtrace::Backtrace::capture()
        );
        // 输出到 stderr
        eprintln!("{}", msg);
        // 写入用户主目录下的日志文件
        if let Some(home) = std::env::var_os("HOME") {
            let log_path = std::path::PathBuf::from(home).join("croc-ui-panic.log");
            let _ = std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .write(true)
                .open(&log_path)
                .and_then(|mut f| {
                    use std::io::Write;
                    f.write_all(msg.as_bytes())
                });
        }
        default_panic(panic_info);
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(TransferState::default())
        .invoke_handler(tauri::generate_handler![
            check_croc_installed,
            start_send,
            start_receive,
            stop_transfer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
