require('application.css')

document.addEventListener('DOMContentLoaded', () => {
  window.myApi.getScriptErrors();
  window.myApi.diag();
  const button = document.getElementById("select-folder");
  const saveFile = document.getElementById("select-output");
  const getRecFile = document.getElementById("recognition-file");
  button.addEventListener("click", () => {
    window.myApi.openFolder();
  })
  saveFile.addEventListener("click", () => {
    window.myApi.showSaveDialog();
    window.myApi.savedFile();
  })
  getRecFile.addEventListener("click", () => {
    window.myApi.openRecognition();
    window.myApi.isRecognition();
  })
  window.myApi.getPath();
  document.getElementById("start-rec").addEventListener("click", () => {
    let btns = document.getElementById("main-buttons");
    let messages = document.getElementById("messages");
    let opacity = 1;
    let startRecButton = document.getElementById("start-rec");
    let loader = document.getElementById("loader");
  
    if (!startRecButton.classList.contains("disabled")) {
      // Показать индикатор загрузки и изменить текст кнопки
      startRecButton.textContent = "Закончить запись";
      loader.style.display = "inline-block";
  
      let timerId = setInterval(() => {
        opacity -= 0.1;
        btns.style.opacity = opacity;
  
        if (opacity <= 0) {
          clearInterval(timerId);
          console.log("Кнопки изменены");
          btns.style.display = "none";
          messages.style.opacity = 0;
          messages.style.display = "block";
          opacity = 0;
  
          timerId = setInterval(() => {
            opacity += 0.1;
            messages.style.opacity = opacity;
  
            if (opacity >= 1) {
              clearInterval(timerId);
              console.log("Поле появилось");
              window.myApi.startRec();
              window.myApi.getMessage();
            }
          }, 1000 / 60);
        }
      }, 1000 / 60);
    }
  });
});