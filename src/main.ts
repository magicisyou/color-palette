import { invoke } from "@tauri-apps/api/tauri";

class Color {
  hex: string;
  constructor(value: string) {
    this.hex = value;
  }
}

let addButton: HTMLButtonElement | null;
let deleteButton: HTMLButtonElement | null;
let sliderRed: HTMLInputElement | null;
let sliderGreen: HTMLInputElement | null;
let sliderBlue: HTMLInputElement | null;
let hexInput: HTMLInputElement | null;
let colorBox1: HTMLDivElement | null;
let rightDiv: HTMLDivElement | null;
let colorBox: HTMLElement | null;
let colors: Color[] = [];

async function addColorToDb() {
  if (hexInput) {
    await invoke("add_color", {
      hex: hexInput.value,
    });
  }
}

async function deleteColorDb() {
  if (hexInput) {
    await invoke("delete_color", {
      hex: hexInput.value,
    });
  }
}

async function loadData() {
  let data: any = await invoke("get_all_colors");
  let index: any;
  for (index in data) {
    let text = data[index];
    const colorDiv = document.createElement("div");
    colorDiv.setAttribute("class", "color");
    colorDiv.id = text;
    colorDiv.style.backgroundColor = text;
    if (rightDiv) {
      rightDiv.appendChild(colorDiv);
    }
    colorDiv.addEventListener("click", () => {
      if (colorBox1 && hexInput) {
        colorBox1.style.backgroundColor = text;
        hexInput.value = text;
        setColorValueByInput();
      }
    });
    let color = new Color(text);
    colors.push(color);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  addButton = document.querySelector("#add-btn");
  if (addButton) {
    addButton.onclick = () => {
      addColor();
    };
  }
  sliderGreen = document.querySelector("#slider-green");
  sliderBlue = document.querySelector("#slider-blue");
  sliderRed = document.querySelector("#slider-red");
  hexInput = document.querySelector("#hex-input");
  if (sliderGreen && sliderBlue && sliderRed && hexInput) {
    sliderGreen.oninput = () => {
      setColorValue();
    };
    sliderBlue.oninput = () => {
      setColorValue();
    };
    sliderRed.oninput = () => {
      setColorValue();
    };
    hexInput.oninput = () => {
      setColorValueByInput();
    };
  }
  colorBox1 = document.querySelector("#color-box1");
  rightDiv = document.querySelector("#right-div");
  deleteButton = document.querySelector("#delete-button");
  if (deleteButton) {
    deleteButton.onclick = () => {
      deleteColor();
    };
  }
  loadData();
});

function setColorValue() {
  if (sliderBlue && sliderGreen && sliderRed && hexInput && colorBox1) {
    let r = sliderRed.valueAsNumber;
    let g = sliderGreen.valueAsNumber;
    let b = sliderBlue.valueAsNumber;
    let hexValue =
      "#" +
      (r < 16 ? "0" + r.toString(16) : r.toString(16)) +
      (g < 16 ? "0" + g.toString(16) : g.toString(16)) +
      (b < 16 ? "0" + b.toString(16) : b.toString(16));
    hexInput.value = hexValue;
    colorBox1.style.backgroundColor = hexValue;
  }
}

function setColorValueByInput() {
  if (hexInput) {
    let hexValue = hexInput.value;
    if (
      isHexValid(hexValue) &&
      colorBox1 &&
      sliderBlue &&
      sliderGreen &&
      sliderRed
    ) {
      colorBox1.style.backgroundColor = hexValue;
      sliderRed.valueAsNumber = parseInt(hexValue.slice(1, 3), 16);
      sliderGreen.valueAsNumber = parseInt(hexValue.slice(3, 5), 16);
      sliderBlue.valueAsNumber = parseInt(hexValue.slice(5, 7), 16);
    }
  }
}

function addColor() {
  if (hexInput) {
    let text = hexInput.value.trim().toLowerCase();
    if (isHexValid(text) && !isColorSaved(text)) {
      const colorDiv = document.createElement("div");
      colorDiv.setAttribute("class", "color");
      colorDiv.id = text;
      colorDiv.style.backgroundColor = text;
      if (rightDiv) {
        rightDiv.appendChild(colorDiv);
      }
      colorDiv.addEventListener("click", () => {
        if (colorBox1 && hexInput) {
          colorBox1.style.backgroundColor = text;
          hexInput.value = text;
          setColorValueByInput();
        }
      });
      let color = new Color(text);
      colors.push(color);
      addColorToDb();
    }
  }
}

function isHexValid(hex: string) {
  let regex = /^#([0-9a-f]{6})$/i;
  return hex.match(regex);
}

function isColorSaved(hex: string) {
  let color: string;
  for (color in colors) {
    if (colors[color].hex === hex) {
      return true;
    }
  }
  return false;
}

function deleteColor() {
  if (hexInput) {
    let hexValue = hexInput.value;
    colorBox = document.getElementById(hexValue);
    if (colorBox) {
      colorBox.remove();
    }
    let index: number;
    let color: string;
    for (color in colors) {
      if (colors[color].hex === hexValue) {
        index = Number(color);
        colors.splice(index, 1);
        break;
      }
    }
    deleteColorDb();
  }
}
