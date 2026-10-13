const form = document.getElementById("surveyForm");

const totalQuestions = document.querySelectorAll(".question-card").length;
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const selectedAnswers = document.querySelectorAll(
    'input[type="radio"]'
);

// GIỮ NGUYÊN CODE KHAI BÁO BIẾN VÀ SỰ KIỆN CHANGE RADIO CŨ
//THÊM ĐOẠN CHUYỂN CÂU
const questions = document.querySelectorAll(".question-card");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
let currentStep = 0;
function updateCard() {
    //HIỂN THỊ CARD CÂU HỎI HIENJ TẠI
    questions.forEach((card, index) => {
        card.classList.toggle("active", index === currentStep);
    });

    //ẨN NÚT QUAY LẠI Ở CARD 0
    if (prevBtn) {
        prevBtn.style.display = (currentStep === 0) ? "none" : "inline-block";
    }

    //ẨN HIỆN NÚT TIẾP TỤC HOÀN THÀNH Ở CÂU CUỐI
    if (currentStep === questions.length - 1) {
        if (nextBtn) nextBtn.style.display = "none";
        if (submitBtn) submitBtn.style.display = "inline-block";
    } else {
        if (nextBtn) nextBtn.style.display = "inline-block";
        if (submitBtn) submitBtn.style.display = "none";
    }

    //CẬP NHẬT THANH TIẾN TRÌNH (BỎ QUA CARD 0)
    if (progressText && progressFill) {
        if (currentStep === 0) {
            progressText.textContent = "Sàng lọc thông tin";
            progressFill.style.width = "0%";
        } else {
            const totalQuestions = questions.length - 1; // TỔNG SỐ CÂU HỎI TRỪ C0
            const actualQuestionNum = currentStep; // CÂU THỨ MẤY . CÂU 1,2,3..
            const percent = (actualQuestionNum / totalQuestions) * 100;

            progressText.textContent = `Câu ${actualQuestionNum}/${totalQuestions}`;
            progressFill.style.width = `${percent}%`;
        }
    }
}

updateCard(); //CHẠY CÂU ĐẦU TIÊN

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        console.log("CLICK ĐÃ CHẠY");
        console.log("currentStep =", currentStep);

        //TRƯỜNG HỢP ĐANG Ở CARD 0 THÔNG TIN SÀNG LỌC
        if (currentStep === 0) {
            const fullName = document.getElementById("fullName").value.trim();
            const age = document.getElementById("age").value;
            const region = document.getElementById("region").value;
            const education = document.getElementById("education").value;
            const testTypeEl = document.querySelector('input[name="testType"]:checked');
            const testType = testTypeEl ? testTypeEl.value : "";
            console.log("ĐÃ LẤY THÔNG TIN")
            console.log("ĐẦY ĐỦ?", !fullName || !age || !region || !education || !testType);

            if (!fullName || !age || !region || !education || !testType) {
                alert("Vui lòng điền đầy đủ thông tin sàng lọc!");
                return;
            }

            const userInfo = {
                fullName: fullName,
                age: age,
                region: region,
                education: education,
                testType: testType,
            };

            sessionStorage.setItem("userInfo", JSON.stringify(userInfo))
            console.log("ĐÃ LƯU USER INFO");
            if (testType === "moca") {
                window.location.href = "moca/moca.html";
                return;
            }
        }
        // ĐANG Ở CÂU HỎI KHẢO SÁT
        else {
            const currentCard = questions[currentStep];

            //NẾU CARD HIỆN TẠI CÓ Ô NHẬP DỮ LIỆU Ô CHỌN
            const textInputs = currentCard.querySelectorAll(
                'input[type="number"], input[type="text"], select'
            );

            if (textInputs.length > 0) {
                //KIỂM TRA CÁC Ô INPUT/SELECT CÓ BỊ TRỐN KHÔNG
                const allFilled = Array.from(textInputs).every(input => input.value.trim() !== "");
                if (!allFilled) {
                    alert("Vui lòng điền/chọn đầy đủ tất cả các ô !");
                    return;
                }

                //nếu là card q1 gọi hàm tính điểm q1
                if (currentCard.querySelector('#ans-year') || currentCard.querySelector('#ans-season')) {
                    calculateQ1Score();
                }
            }
            //nếu card hiện tại là câu trắc nghiệm
            else {
                if (currentStep === 2 || currentStep === 3) {
                    const checked = currentCard.querySelector('input[type="radio"]:checked');
                    if (!checked) {
                        alert("Vui lòng chọn câu trả lời !");
                        return;
                    }

                    if (currentStep === 2) {
                        const scoreQ2 = parseInt(checked.value);
                        console.log("Điểm câu 2:", scoreQ2);
                    }

                    if (currentStep === 3) {
                        const scoreQ3 = parseInt(checked.value);
                        console.log("Điểm câu 3:", scoreQ3);
                    }
                }
            }
            if (currentStep === 4) {
                const correctAnswers = [93, 86, 79, 72, 65];
                let scoreQ4 = 0;

                correctAnswers.forEach((correct, index) => {
                    const input = currentCard.querySelector(`#sub${index + 1}`);

                    if (parseInt(input.value) === correct) {
                        scoreQ4++;
                    }
                });

                console.log("Điểm câu 4:", scoreQ4);
            }

            if (currentStep === 5) {
                const correctWords = [
                    ["Quả Táo", "quả Táo", "Quả táo", "qua tao", "quả táo", "quatao", "quảtao", "Qua Tao", "Qua tao"],
                    ["Chiếc Xe", "chiếc xe", "Chiếc xe", "chiếc Xe", "chiec xe", "Chiec xe", "Chiec Xe", "chiec Xe", "chiecxe"],
                    ["Cây Bút", "cây bút", "cay but", "Cay but", "cay But", "Cay But", "caybut"]
                ];

                const userWords = [
                    currentCard.querySelector("#word1").value.trim().toLowerCase(),
                    currentCard.querySelector("#word2").value.trim().toLowerCase(),
                    currentCard.querySelector("#word3").value.trim().toLowerCase()
                ];

                let scoreQ5 = 0;
                const remainingWords = correctWords.map(words => [...words]);

                userWords.forEach(word => {
                    for (let i = 0; i < remainingWords.length; i++) {
                        if (remainingWords[i].includes(word)) {
                            scoreQ5++;
                            remainingWords.splice(i, 1);
                            break;
                        }
                    }
                });

                console.log("Điểm câu 5:", scoreQ5);


            }
            if (currentStep === 6) {
                const correctObjects = [
                    ["Đồng Hồ", "đồng hồ", "dong ho", "dongho", "Dong Ho", "Dong ho", "dong Ho", "Đồng hồ"],
                    ["Cây Bút", "cây bút", "cay but", "caybut", "Cây bút", "Cái Bút", "cái bút", "cai but", "caibut", "Cái bút", "Bút", "bút", "but", "Cây Viết", "cây viết", "cay viet", "cayviet", "Bút Máy", "bút máy", "butmay", "but may", "Bút máy"]
                ];
                const userObjects = [
                    currentCard.querySelector("#obj1").value.trim().toLowerCase(),
                    currentCard.querySelector("#obj2").value.trim().toLowerCase()
                ];

                let scoreQ6 = 0;
                const remainingObjects = correctObjects.map(objects => [...objects]);

                userObjects.forEach(object => {
                    for (let i = 0; i < remainingObjects.length; i++) {
                        if (remainingObjects[i].includes(object)) {
                            scoreQ6++;
                            remainingObjects.splice(i, 1);
                            break;
                        }
                    }
                });

                console.log("Điểm câu 6:", scoreQ6);
            }
            if (currentStep === 7) {
                const checked = currentCard.querySelector(
                    'input[type="radio"]:checked'
                );

                const scoreQ7 = parseInt(checked.value);

                console.log("Điểm câu 7:", scoreQ7);
            }
            if (currentStep === 8) {
                const checked = currentCard.querySelector(
                    'input[type="radio"]:checked'
                );

                const scoreQ8 = parseInt(checked.value);

                console.log("Điểm câu 8:", scoreQ8);
            }
            if (currentStep === 9) {
                const q9Score = document.getElementById("q9Score");

                if (!q9Score || q9Score.value !== "1") {
                    alert("Vui lòng hoàn thành thao tác nhắm mắt liên tục trong 3 giây!");
                    return;
                }
            }
            if (currentStep === 10) {
                const sentence = currentCard.querySelector("#q10Sentence").value.trim();

                let scoreSentence = 0;

                if (sentence.length > 0) {
                    scoreSentence = 1;
                }

                console.log("Điểm câu 10:", scoreSentence);
            }


        }
        //CHUYỂN SANG CÂU TIẾP THEO
        console.log("CHUẨN BỊ CHUYỂN CÂU", currentStep);

        if (currentStep < questions.length - 1) {
            currentStep++;
            updateCard();
        }

    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateCard();
        }
    });
} //DÒNG TIẾP THEO TIẾP TỤC ĐẾN FORM.ADD.. SUBMIT CŨ, CODE SUBMIT TÍNH ĐIỂM GIỮ NGUYÊN BÊN DƯỚI
form.addEventListener("submit", function (event) {
    event.preventDefault();

    let totalScore = 0

    const scoreQ1 = calculateQ1Score();
    totalScore += scoreQ1;

    const city = document.getElementById("q2city").value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const country = document.getElementById("q2country").value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (city === "" || country === "") {
        alert("Vui lòng trả lời đầy đủ câu 2!");
        return;
    }

    const correctCity = city === "hai phong";
    const correctCountry = country === "viet nam" || country === "vietnam";

    let scoreQ2 = 0;

    if (correctCity && correctCountry) {
        scoreQ2 = 5;
    } else if (correctCity || correctCountry) {
        scoreQ2 = 3;
    }
    totalScore += scoreQ2;

    const q3 = document.querySelector('input[name="q3"]:checked');
    if (!q3) {
        alert("Vui lòng trả lời câu 3!");
        return;
    }
    const scoreQ3 = parseInt(q3.value);
    totalScore += scoreQ3

    const correctAnswers = [93, 86, 79, 72, 65];
    let scoreQ4 = 0;

    correctAnswers.forEach((correct, index) => {
        const input = document.getElementById(`sub${index + 1}`);

        if (input && parseInt(input.value) === correct) {
            scoreQ4++;
        }
    });

    totalScore += scoreQ4

    const correctWords = [
        ["Quả Táo", "quả táo", "qua tao", "quatao", "Qua tao"],
        ["Chiếc Xe", "chiếc xe", "chiec xe", "chiecxe", "Chiec xe"],
        ["Cây Bút", "cây bút", "cay but", "caybut", "Cây bút"]
    ];

    const userWords = [
        document.getElementById("word1").value.trim().toLowerCase(),
        document.getElementById("word2").value.trim().toLowerCase(),
        document.getElementById("word3").value.trim().toLowerCase()
    ];

    let scoreQ5 = 0;
    const remainingWords = correctWords.map(words => [...words]);

    userWords.forEach(word => {
        if (word === "") return;
        for (let i = 0; i < remainingWords.length; i++) {
            if (remainingWords[i].includes(word)) {
                scoreQ5++;
                remainingWords.splice(i, 1);
                break;
            }
        }
    });

    totalScore += scoreQ5

    const correctObjects = [
        ["Đồng Hồ", "đồng hồ", "dong ho", "dongho", "Đồng hồ"],
        ["Cây Bút", "cây bút", "cay but", "caybut", "Cây bút", "Cái Bút", "cái bút", "cai but", "caibut", "Cái bút", "Bút", "bút", "but", "Cây Viết", "cây viết", "cay viet", "cayviet", "Bút Máy", "bút máy", "butmay", "but may", "Bút máy"]
    ];

    const userObjects = [
        document.getElementById("obj1").value.trim().toLowerCase(),
        document.getElementById("obj2").value.trim().toLowerCase(),
    ];

    let scoreQ6 = 0;
    const remainingObjects = correctObjects.map(objects => [...objects]);

    userObjects.forEach(object => {
        for (let i = 0; i < remainingObjects.length; i++) {
            if (remainingObjects[i].includes(object)) {
                scoreQ6++;
                remainingObjects.splice(i, 1);
                break;
            }
        }
    });
    totalScore += scoreQ6;

    const q7 = document.querySelector('input[name="q7"]:checked');
    if (!q7) {
        alert("Vui lòng trả lời câu 7!");
        return;
    }
    const scoreQ7 = parseInt(q7.value);
    totalScore += scoreQ7

    const q8 = document.querySelector('input[name="q8"]:checked');
    if (!q8) {
        alert("Vui lòng trả lời câu 8!")
        return;
    }
    const scoreQ8 = parseInt(q8.value);
    totalScore += scoreQ8

    const scoreQ9 = parseInt(
        document.getElementById("q9Score").value
    );

    console.log("Q9 SCORE =", scoreQ9);

    if (scoreQ9 !== 1) {
        alert("Vui lòng trả lời câu 9!")
        return;
    }

    totalScore += scoreQ9;

    const sentence = document.getElementById("q10Sentence").value.trim();
    if (!sentence) {
        alert("Vui lòng hoàn thành phần viết câu ở câu 10");
        return;
    }
    const normalizedsentence = sentence
        .toLowerCase()
        .normalize("NFC")
        .replace(/[.,!?;:"''``]/g, "")
        .trim();

    const words = normalizedsentence
        .split(/\s+/)
        .filter(Boolean);

    const hasletters = /\p{L}/u.test(normalizedsentence);
    const hasenoughwwords = words.length >= 3;
    const hasdifferentwords = new Set(words).size >= 2;
    const scoreSentence = hasletters && hasenoughwwords && hasdifferentwords ? 1 : 0;
    console.log("Câu đã  nhập:", sentence);
    console.log("số từ:", words.length);
    console.log("điểm viêt câu:", scoreSentence);

    const canvas = document.getElementById("drawCanvas");
    const ctx = canvas.getContext("2d");

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const shape1 = window.getShapeLines(1);
    const shape2 = window.getShapeLines(2);


    let scoreDrawing = 0;

    console.log("hình 1:", shape1);
    console.log("hình 2:", shape2);

    const shape1has5lines = shape1.length === 5;
    const shape2has5lines = shape2.length === 5;
    if (shape1has5lines && shape2has5lines) {
        const shapesIntersect = window.checkTwoShapesIntersect();

        console.log("Hình vẽ có giao nhau không:", shapesIntersect);

        if (shapesIntersect === true) {
            scoreDrawing = 1;
        }
    }

    console.log("Điểm vẽ hình:", scoreDrawing);

    totalScore += scoreSentence + scoreDrawing;

    sessionStorage.setItem("score", totalScore);
    sessionStorage.setItem("totalQuestion", "30");
    console.log("TỔNG ĐIỂM:", totalScore);

    window.location.href = "result.html";
});

const closeEyesBtn = document.getElementById("closeEyesBtn");
const q9Status = document.getElementById("q9Status");
const q9Score = document.getElementById("q9Score");

const startCameraBtn = document.getElementById("startCameraBtn");
const q9Camera = document.getElementById("q9camera");
const cameraStat = document.getElementById("q9CamStatus");

if (startCameraBtn && q9Camera && cameraStat) {
    startCameraBtn.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });

            q9Camera.srcObject = stream;
            q9Camera.style.display = "block";
            cameraStat.textContent = "Camera đang on";
            startCameraBtn.disabled = true;
        } catch (error) {
            cameraStat.textContent =
                "Không thể bật camera. Hãy kiểm tra quyền truy cập.";
            console.error(error);
        }
    });
}

if (closeEyesBtn && q9Status && q9Score) {
    closeEyesBtn.addEventListener("click", () => {
        q9Status.textContent = "Trạng thái: Đang thực hiện...";

        setTimeout(() => {
            q9Status.textContent = "Trạng thái: Hoàn thành 3 giây !";
            q9Status.style.color = "#22b169";
            q9Score.value = "1";
            console.log("Điểm câu 9:", 1);
        }, 3000);
    });
}




const resetButton = document.getElementById("resetButton");
if (resetButton) {
    resetButton.addEventListener("click", function () {
        form.reset();

        sessionStorage.removeItem("score");

        document.getElementById("result").textContent = "";
        document.getElementById("warning").textContent = "";

        const message = document.getElementById("message");

        message.textContent = "Đã làm lại khảo sát !";
        message.style.opacity = "1"

        setTimeout(function () {
            message.style.opacity = "0"
        }, 2500);
    });
}

function calculateQ1Score() {
    const yearInput = document.getElementById('ans-year');
    const seasonInput = document.getElementById('ans-season');
    const monthInput = document.getElementById('ans-month');
    const dayInput = document.getElementById('ans-day');
    const weekdayInput = document.getElementById('ans-weekday');

    const userYear = yearInput ? yearInput.value.trim() : "";
    const userSeason = seasonInput ? seasonInput.value : "";
    const userMonth = monthInput ? monthInput.value.trim() : "";
    const userDay = dayInput ? dayInput.value.trim() : "";
    const userWeekday = weekdayInput ? weekdayInput.value : "";

    const now = new Date();
    let scoreQ1 = 0;

    // KIỂM TRA NĂM
    if (parseInt(userYear) === now.getFullYear()) {
        scoreQ1++;
    }

    //KIỂM TRA MÙA 
    const actualMonth = now.getMonth() + 1;
    let actualSeason = "";

    // TỪ THÁNG THỰC TẾ SUY RA MÙA THỰC TẾ
    if (actualMonth >= 2 && actualMonth <= 4) {
        actualSeason = "Xuan";
    } else if (actualMonth >= 5 && actualMonth <= 7) {
        actualSeason = "Ha";
    } else if (actualMonth >= 8 && actualMonth <= 10) {
        actualSeason = "Thu";
    } else {
        actualSeason = "Dong";
    }

    // SO SÁNH MÙA NGƯỜI DÙNG CHỌN VỚI MÙA THỰC TẾ
    if (userSeason === actualSeason) scoreQ1++;

    if (parseInt(userMonth) === actualMonth) {
        scoreQ1++;
    }

    if (parseInt(userDay) === now.getDate()) {
        scoreQ1++;
    }
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const actualWeekday = now.getDay() + 1;

    if (parseInt(userWeekday) === actualWeekday) {
        scoreQ1++;
    }

    console.log("Điểm câu 1:", scoreQ1);
    return scoreQ1;
}

const templateCanvas = document.getElementById("templateCanvas");

if (templateCanvas) {
    const ctxTemplate = templateCanvas.getContext("2d");

    ctxTemplate.lineWidth = 2;
    ctxTemplate.strokeStyle = "#555";
    ctxTemplate.lineJoin = "round"

    function drawPentagon(ctx, centerX, centerY, radius = 0) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;

            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.stroke();
    }

    // VẼ HÌNH NGŨ GIÁC NGOÀI
    drawPentagon(ctxTemplate, 125, 100, 65);
    drawPentagon(ctxTemplate, 195, 100, 65);
}


const canvas = document.getElementById("drawCanvas"); //LẤY CANVAS TỪ HTML
const clearCanvasBtn = document.getElementById("clearCanvasBtn"); //LẤY NÚT VẼ LẠI
const newShapeBtn = document.getElementById("newShapeBtn"); //LẤY NÚT BẮT ĐẦU HÌNH VẼ TIẾP THEO

let drawingLines = []; // MẢNG LƯU TRỮ CÁC ĐƯỜNG VẼ CỦA HÌNH HIỆN TẠI

if (canvas && clearCanvasBtn) { // Kiểm tra xem 2 phần tử có tồn tại kh
    const ctx = canvas.getContext("2d"); // LẤY BÚT VẼ CTX LÀ TẮT CỦA CONTEXT,GIỐNG NHƯ CÔNG CỤ ĐỂ VẼ TRÊN CANVAS

    ctx.lineWidth = 3; //ĐỘ DÀY ĐƯỜNG VẼ
    ctx.lineCap = "round"; //ĐẦU MŨI BÚT VẼ TRÒN
    ctx.lineJoin = "round"; //GIAO NỐI ĐƯỜNG VẼ TRÒN

    let drawing = false; //BIẾN DRAWING BIẾN NÀY TRẢ LỜI NGƯỜI KHẢO SÁT CÓ VẼ KHÔNG BAN ĐẦU DRAWING = FALSE LÀ CHƯA VẼ,KHI BẮT ĐẦU CHẠM VÀ KÉO LÀ DRAWING = TRUE ĐANG VẼ,NHẤC TAY = FALSE DỪNG 6767676
    let startX = 0; //VỊ TRÍ BẮT ĐẦU VẼ X
    let startY = 0; //VỊ TRÍ BẮT ĐẦU VẼ Y

    let lastPoint = null;
    let firstPoint = null; //BIẾN LƯU VỊ TRÍ ĐIỂM CUỐI CÙNG ĐỂ GẮN ĐIỂM KHI VẼ TIẾP THEO
    const closeDistance = 35; // KHOẢNG CÁCH TỐI THIỂU ĐỂ GẮN ĐIỂM

    const snapDistance = 28; // KHOẢNG CÁCH TỐI THIỂU ĐỂ GẮN ĐIỂM

    let lines = drawingLines; // MẢNG LƯU TRỮ CÁC ĐƯỜNG VẼ
    let currentShapeId = 1; // ID CỦA HÌNH VẼ HIỆN TẠI

    window.getShapeLines = function (shapeId) { //HÀM LẤY CÁC ĐƯỜNG VẼ CỦA HÌNH HIỆN TẠI
        return lines.filter(line => line.shapeId === shapeId);
    };

    function doLinesIntersect(a, b) { //HÀM KIỂM TRA 2 ĐƯỜNG VẼ CÓ GIAO NHAU KHÔNG
        const epsilon = 0.000001; // ĐỘ CHÍNH XÁC NHỎ ĐỂ TRÁNH LỖI SỐ HỌC

        function orientation(p, q, r) {
            return (q.y - p.y) * (r.x - p.x) -
                (q.x - p.x) * (r.y - p.y);
        }

        function onSegment(p, q, r) {
            return q.x >= Math.min(p.x, r.x) - epsilon &&
                q.x <= Math.max(p.x, r.x) + epsilon &&
                q.y >= Math.min(p.y, r.y) - epsilon &&
                q.y <= Math.max(p.y, r.y) + epsilon;
        }

        const p1 = { x: a.startX, y: a.startY };
        const q1 = { x: a.endX, y: a.endY };
        const p2 = { x: b.startX, y: b.startY };
        const q2 = { x: b.endX, y: b.endY };

        const o1 = orientation(p1, q1, p2);
        const o2 = orientation(p1, q1, q2);
        const o3 = orientation(p2, q2, p1);
        const o4 = orientation(p2, q2, q1);

        if (
            ((o1 > epsilon && o2 < -epsilon) ||
                (o1 < -epsilon && o2 > epsilon)) &&
            ((o3 > epsilon && o4 < -epsilon) ||
                (o3 < -epsilon && o4 > epsilon))
        ) {
            return true;
        }

        if (Math.abs(o1) < epsilon && onSegment(p1, p2, q1)) return true;
        if (Math.abs(o2) < epsilon && onSegment(p1, q2, q1)) return true;
        if (Math.abs(o3) < epsilon && onSegment(p2, p1, q2)) return true;
        if (Math.abs(o4) < epsilon && onSegment(p2, q1, q2)) return true;

        return false;
    }

    function getPosition(e) { // ĐỂ LẤY VỊ TRÍ NGÓN TAY HOẶC CHUỘT ĐANG TƯƠNG TÁC TRÊN CANVAS
        const rect = canvas.getBoundingClientRect(); //LẤY VỊ TRÍ VÀ KÍCH THƯỚC THỰC TẾ CỦA CANVAS TRÊN MÀN HÌNH

        const scaleX = canvas.width / rect.width; //TỈ LỆ KÍCH THƯỚC CANVAS THỰC TẾ SO VỚI KÍCH THƯỚC HIỂN THỊ
        const scaleY = canvas.height / rect.height; //TỈ LỆ KÍCH THƯỚC CANVAS THỰC TẾ SO VỚI KÍCH THƯỚC HIỂN THỊ

        return { // CHUYỂN TẠO ĐỘ CỦA CHUỘT NGÓN TAY THÀNH TỌA ĐỘ BÊN TRONG CANVAS
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    window.doShapesIntersect = function (shape1, shape2) { //HÀM KIỂM TRA HÌNH VẼ HIỆN TẠI CÓ GIAO NHAU KHÔNG
        for (const line1 of shape1) {
            for (const line2 of shape2) {
                if (doLinesIntersect(line1, line2)) {
                    return true;
                }
            }
        }
        return false;
    }

    window.checkTwoShapesIntersect = function () { //HÀM KIỂM TRA 2 HÌNH VẼ CÓ GIAO NHAU KHÔNG
        const shape1 = window.getShapeLines(1);
        const shape2 = window.getShapeLines(2);

        if (shape1.length === 0 || shape2.length === 0) {
            return false; // Nếu một trong hai hình không có đường vẽ, không thể giao nhau
        }

        return window.doShapesIntersect(shape1, shape2);
    };

    function redraw() { //HÀM VẼ LẠI TOÀN BỘ ĐƯỜNG VẼ MỖI KHI NGƯỜI DÙNG KÉO CHẠM
        ctx.clearRect(0, 0, canvas.width, canvas.height); //XÓA TOÀN BỘ CANVAS

        lines.forEach(line => { //DUYỆT QUA MẢNG LƯU TRỮ CÁC ĐƯỜNG VẼ
            ctx.beginPath();
            ctx.moveTo(line.startX, line.startY); //BẮT ĐẦU VẼ TỪ VỊ TRÍ BẮT ĐẦU
            ctx.lineTo(line.endX, line.endY); //VẼ ĐẾN VỊ TRÍ KẾT THÚC
            ctx.stroke();
        });
    }

    canvas.addEventListener("pointerdown", (e) => { //POINTERDOWN XẢY RA KHI NGƯỜI DÙNG BẮT DDAAUAF CHẠM KÉO
        e.preventDefault();
        drawing = true; //BẮT ĐẦU VẼ

        const pos = getPosition(e); //LẤY VỊ TRÍ BẮT ĐẦU
        if (!firstPoint) {
            firstPoint = { x: pos.x, y: pos.y }; //LƯU VỊ TRÍ ĐIỂM ĐẦU TIÊN
        }
        if (lastPoint) {
            const distance = Math.hypot(
                pos.x - lastPoint.x,
                pos.y - lastPoint.y
            );

            if (distance < snapDistance) {
                startX = lastPoint.x;
                startY = lastPoint.y;
            } else {
                startX = pos.x; //GÁN VỊ TRÍ BẮT ĐẦU X
                startY = pos.y; //GÁN VỊ TRÍ BẮT ĐẦU Y
            }
        } else {
            startX = pos.x; //GÁN VỊ TRÍ BẮT ĐẦU X
            startY = pos.y; //GÁN VỊ TRÍ BẮT ĐẦU Y
        }

        canvas.setPointerCapture(e.pointerId); //BẮT ĐẦU BẮT SỰ KIỆN CHO NGÓN TAY HOẶC CHUỘT
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!drawing) return;

        e.preventDefault();

        const pos = getPosition(e);

        redraw(); //VẼ LẠI TOÀN BỘ ĐƯỜNG VẼ MỖI KHI NGƯỜI DÙNG KÉO CHẠM

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    });

    canvas.addEventListener("pointerup", (e) => { //NGƯỜI DÙNG NHẤC LÊN DỪNG VẼ
        if (!drawing) return;

        e.preventDefault();

        const pos = getPosition(e);

        const distanceToFirst = firstPoint
            ? Math.hypot(pos.x - firstPoint.x, pos.y - firstPoint.y)
            : Infinity;
        console.log("hình số:", currentShapeId);
        console.log("khoảng cách đến điểm đầu tiên:", distanceToFirst);

        let endX = pos.x;
        let endY = pos.y;

        if (firstPoint && distanceToFirst < closeDistance) {
            endX = firstPoint.x;
            endY = firstPoint.y;
        }
        lines.push({
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            shapeId: currentShapeId
        }); //LƯU VỊ TRÍ BẮT ĐẦU VÀ KẾT THÚC CỦA ĐƯỜNG VẼ VÀO MẢNG LINES

        lastPoint = {
            x: endX,
            y: endY
        }; //CẬP NHẬT VỊ TRÍ CUỐI CÙNG ĐỂ GẮN ĐIỂM

        drawing = false; //DỪNG VẼ

        if (canvas.hasPointerCapture(e.preventDefault)) {
            canvas.releasePointerCapture(e.preventDefault);
        }
        redraw(); //VẼ LẠI TOÀN BỘ ĐƯỜNG VẼ MỖI KHI NGƯỜI DÙNG KÉO CHẠM
    });

    canvas.addEventListener("pointercancel", (e) => {
        drawing = false; //NẾU THAO TÁC BỊ HỆ THỐNG HỦY GIỮA CHỪNG THÌ DỪNG VẼ
        firstPoint = null; //XÓA VỊ TRÍ ĐẦU TIÊN
    });

    clearCanvasBtn.addEventListener("click", () => {
        drawingLines.length = 0; //XÓA TOÀN BỘ CÁC ĐƯỜNG VẼ
        lastPoint = null; //XÓA VỊ TRÍ CUỐI CÙNG
        firstPoint = null; //XÓA VỊ TRÍ ĐẦU TIÊN
        currentShapeId = 1; //RESET ID HÌNH VẼ
        ctx.clearRect(0, 0, canvas.width, canvas.height); //XÓA TOÀN BỘ CANVAS
        redraw(); //VẼ LẠI TOÀN BỘ ĐƯỜNG VẼ
    });
    newShapeBtn.addEventListener("click", () => {
        currentShapeId++;
        lastPoint = null;
        firstPoint = null;
        console.log("đang vẽ hình số:", currentShapeId);
    });
}
document.addEventListener("click", function (event) {
    const button = event.target.closest(".readBtn");
    if (!button) return;
    window.speechSynthesis.cancel();
    const text = button.dataset.text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.6;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
});
