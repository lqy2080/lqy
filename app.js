// 不需要安装依赖。任务只保存在你自己的浏览器里。
"use strict";

const STORAGE_KEY = "lqy-first-todo-v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const summary = document.querySelector("#summary");
const empty = document.querySelector("#empty");
const message = document.querySelector("#message");
let tasks = [];

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!Array.isArray(saved) || !saved.every(task =>
    task && typeof task.text === "string" && typeof task.done === "boolean"
  )) throw new Error("Invalid saved tasks");
  tasks = saved;
} catch {
  showMessage("无法读取以前的记录，已打开空清单。你仍然可以添加任务。");
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    showMessage("");
  } catch {
    showMessage("浏览器未能保存，当前任务仍可使用，关闭页面后可能丢失。");
  }
}

function render() {
  list.replaceChildren();
  tasks.forEach((task, index) => {
    const row = document.createElement("li");
    row.classList.toggle("done", task.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "标记完成：" + task.text);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      row.classList.toggle("done", task.done);
      save();
      updateSummary();
    });

    const text = document.createElement("span");
    // textContent 会把输入当作文字显示。
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.textContent = "删除";
    remove.setAttribute("aria-label", "删除任务：" + task.text);
    remove.addEventListener("click", () => {
      tasks.splice(index, 1);
      save();
      render();
      input.focus();
    });

    row.append(checkbox, text, remove);
    list.append(row);
  });
  updateSummary();
}

function updateSummary() {
  summary.textContent = "共 " + tasks.length + " 项 · 已完成 " +
    tasks.filter(task => task.done).length + " 项";
  empty.hidden = tasks.length > 0;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showMessage("请先输入任务内容。");
    input.focus();
    return;
  }
  tasks.push({ text: text.slice(0, 120), done: false });
  save();
  render();
  input.value = "";
  input.focus();
});

render();

