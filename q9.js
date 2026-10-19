const moveX = document.getElementById("moveX");
const shapeMsg = document.getElementById("shapeMsg");
let shapeAnswer = null;

let xSelected = false;
let xPlaced = false;

// Bấm vào dấu X
moveX.addEventListener("click", () => {
    xSelected = true;
});

// Chọn ô giữa hình
document.querySelectorAll(
    ".shape-triangle, .shape-square, .shape-rectangle"
).forEach(shape => {

    shape.addEventListener("click", () => {

        if (!xSelected) {
            return;
        }

        const centerBox = shape.querySelector(".centerbox");
        if (!centerBox) {
            return;
        }
        // Xóa dấu X ở vị trí cũ
        document.querySelectorAll(".centerbox").forEach(box => {
            box.textContent = "";
        });

        // Đặt X vào ô được chọn
        centerBox.textContent = "X";
        centerBox.style.fontWeight = "bold";
        centerBox.style.fontSize = "16px";
        centerBox.style.display = "flex";
        centerBox.style.alignItems = "center";
        centerBox.style.justifyContent = "center";

        shapeAnswer = shape.dataset.shape;
        xSelected = false;
    });
});

// Ý 2: Chọn hình có kích thước lớn nhất
let largestAnswer = null;

document.querySelectorAll(".largest-option").forEach(button => {
    button.addEventListener("click", () => {

        // Bỏ trạng thái chọn cũ
        document.querySelectorAll(".largest-option").forEach(option => {
            option.classList.remove("selected");
        });

        // Đánh dấu đáp án được chọn
        button.classList.add("selected");

        largestAnswer = button.dataset.answer;
    });
});
function isQ9Complete() {
    return shapeAnswer !== null && largestAnswer !== null;
}
function calculateQ9Score() {
    let scoreQ9 = 0;

    if (shapeAnswer === "triangle") {
        scoreQ9++
    }

    if (largestAnswer === "square") {
        scoreQ9++
    }

    return scoreQ9;
}

window.isQ9Complete = isQ9Complete;
window.calculateQ9Score = calculateQ9Score;