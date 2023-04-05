require('application.css')

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById("select-folder");
  button.addEventListener("click", () => {
    window.myApi.openFolder();
  })
  window.myApi.getPath();

  document.getElementById("start-rec").addEventListener("click", () => {
    window.myApi.startRec();
    window.myApi.getMessage();
  })
});