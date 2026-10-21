import { db } from "./firebase.js"
import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("surveyForm");

const totalQuestions = document.querySelectorAll(".question-card").length;
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

const selectedAnswers = document.querySelectorAll(
    'input[type="radio"]'
);

const questions = document.querySelectorAll(".question-card");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
let currentStep = 0;
let currentCard = questions[currentStep];

function updateCard() {
    currentCard = questions[currentStep];

    questions.forEach((card, index) => {
        const isActive = index === currentStep;
        card.classList.toggle("active", isActive);

        const fields = card.querySelectorAll("input, select, textarea");

        fields.forEach(field => {
            if (isActive) {
                if (field.dataset.wasRequired === "true") {
                    field.required = true;
                }
            } else {
                if (field.required) {
                    field.dataset.wasRequired = "true";
                    field.required = false;
                }
            }
        });
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
            const totalQuestions = questions.length - 1;
            const actualQuestionNum = currentStep;
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
        if (!kiemTraCau10()) return;

        //TRƯỜNG HỢP ĐANG Ở CARD 0 THÔNG TIN SÀNG LỌC
        if (currentStep === 0) {
            const fullName = document.getElementById("fullName").value.trim();
            const age = document.getElementById("age").value;
            const region = document.getElementById("region").value;
            const education = document.getElementById("education").value;
            console.log("ĐÃ LẤY THÔNG TIN")
            console.log("ĐẦY ĐỦ?", !fullName || !age || !region || !education);

            if (!fullName || !age || !region || !education) {
                alert("Vui lòng điền đầy đủ thông tin sàng lọc!");
                return;
            }

            const userInfo = {
                fullName: fullName,
                age: age,
                region: region,
                education: education,
            };

            sessionStorage.setItem("userInfo", JSON.stringify(userInfo))
            console.log("ĐÃ LƯU USER INFO");
        }

        else {

            if (currentCard.querySelector("#photoPreview")) {
                const clockPhoto = document.getElementById("photoPreview");
                if (!clockPhoto || clockPhoto.style.display === "none" || !clockPhoto.src || !strClockImageBase64) {
                    alert("Vui lòng hoàn thành câu 8!");
                    return;
                }
            }
            if (currentCard.querySelector("#shapeQuestion")) {
                if (!window.isQ9Complete || !window.isQ9Complete()) {
                    alert("Vui lòng hoàn thành câu 9!");
                    return;
                }
            }

            if (currentCard.querySelector("#actionBtn")) {
                if (runningQ5 || timeLeftQ5 === 60) {
                    alert("Vui lòng hoàn thành câu 5!");
                    return;
                }
            }

            const textInputs = currentCard.querySelectorAll(
                'input[type="number"], input[type="text"], select'
            );

            if (textInputs.length > 0 && currentStep !== 10) {
                //KIỂM TRA CÁC Ô INPUT/SELECT CÓ BỊ TRỐN KHÔNG
                const allFilled = Array.from(textInputs).every(input => input.value.trim() !== "");
                if (!allFilled) {
                    alert("Vui lòng điền/chọn đầy đủ tất cả các ô !");
                    return;
                }

                if (currentCard.querySelector('#ans-year') || currentCard.querySelector('#ans-season')) {
                    calculateQ1Score();
                }
            }

            else {
                if (currentStep === 2) {
                    const checked = currentCard.querySelector('input[type="radio"]:checked');
                    if (!checked) {
                        alert("Vui lòng chọn câu trả lời !");
                        return;
                    }
                }
            }

            if (currentStep === 2) {
                console.log("Điểm câu 2:", calculateQ2Score());
            }
            if (currentStep === 4) {
                console.log("Điểm câu 4:", calculateQ4Score());
            }

            if (currentStep === 5) {
                console.log("Điểm câu 5:", scoreQ5);
            }

            if (currentStep === 6) {
                console.log("Điểm câu 6:", calculateQ6Score());
            }

            if (currentStep === 7) {
                console.log("Điểm câu 7:", calculateQ7Score());
            }

            if (currentStep === 9) {
                console.log("Điểm câu 9:", calculateQ9Score());
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
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let totalScore = 0

    if (!kiemTraCau10()) return;

    totalScore += calculateQ1Score();

    totalScore += calculateQ2Score();

    totalScore += calculateQ4Score();

    totalScore += scoreQ5;

    totalScore += calculateQ6Score();

    totalScore += calculateQ7Score();

    totalScore += calculateQ10Score();

    const clockPhoto = document.getElementById("photoPreview");
    if (!clockPhoto || clockPhoto.style.display === "none" || !clockPhoto.src || !strClockImageBase64) {
        alert("Vui lòng chụp ảnh hoặc chọn ảnh bài xe đồng hồ!");
        return;
    }

    const scoreQ9 = window.calculateQ9Score();
    totalScore += scoreQ9;

    sessionStorage.setItem("score", totalScore);
    sessionStorage.setItem("totalQuestion", "30");
    sessionStorage.setItem("clockScoreStatus", "pending");
    sessionStorage.setItem("scoreBeforeClock", totalScore);

    console.log("Điểm chưa bao gồm câu 8:", totalScore)
    console.log("Q8STATUS: đang chờ chấm")

    const imageSize = new Blob([strClockImageBase64]).size;

    // Chừa khoảng an toàn vì Firestore giới hạn document ở 1 MiB
    if (imageSize > 700 * 1024) {
        alert("Ảnh còn quá lớn. Vui lòng giảm dung lượng ảnh trước khi nộp.");
        return;
    }

    try {
        // Lưu bài vẽ và thông tin phục vụ chấm Câu 8
        const docRef = await addDoc(collection(db, "testResult"), {
            imageBase64: strClockImageBase64,
            clockStatus: "cho_cham",
            clockScore: null,
            submittedAt: serverTimestamp()
        });

        // Lưu mã bài để dùng khi xem kết quả
        sessionStorage.setItem("clockSubmissionId", docRef.id);

        console.log("Đã lưu bài vẽ:", docRef.id);

        // Chỉ chuyển trang khi lưu thành công
        window.location.href = "result.html";

    } catch (error) {
        console.error("Lỗi lưu bài vẽ:", error);
        alert(
            "Chưa lưu được bài vẽ. Vui lòng kiểm tra kết nối Firebase " +
            "và quyền truy cập Firestore."
        );
    }
});

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

let localStream = null;
let strClockImageBase64 = ""
const video = document.getElementById('cameraStream');
const captureCanvas = document.getElementById('captureCanvas');
const photoPreview = document.getElementById('photoPreview');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const cameraStatus = document.getElementById('cameraStatus');

// 2. Kích hoạt Camera mặt sau (Environment)
async function moCamera() {
    cameraStatus.innerText = "Đang xin quyền mở camera...";
    try {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        const constraints = { video: { facingMode: "environment", width: 640, height: 640 } };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = localStream;

        photoPreview.style.display = "none";
        video.style.display = "block";
        captureBtn.disabled = false;
        retakeBtn.style.display = "none";
        cameraStatus.innerText = "🎥 Camera đã sẵn sàng! Hãy căn nét tờ giấy.";
    } catch (error) {
        console.error("Lỗi mở camera:", error);
        cameraStatus.innerText = "❌ Không thể mở camera. Vui lòng kiểm tra quyền truy cập thiết bị!";
    }
}
window.moCamera = moCamera;

// 3. Đóng băng hình ảnh và xuất chuỗi Base64
function chupAnhDongHo() {
    if (!localStream) return;
    const ctxHidden = captureCanvas.getContext('2d');
    ctxHidden.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    strClockImageBase64 = captureCanvas.toDataURL('image/jpeg', 0.8); // Trích xuất chuỗi ảnh [Context]
    console.log(
        "Dung lượng ảnh:",
        (strClockImageBase64.length * 3 / 4 / 1024).toFixed(1),
        "Kb"
    );

    photoPreview.src = strClockImageBase64;
    photoPreview.style.display = "block";
    video.style.display = "none";

    captureBtn.disabled = true;
    retakeBtn.style.display = "inline-block";
    cameraStatus.innerText = "✔️ Đã chụp thành công! Hình ảnh đã được lưu vào bộ nhớ tạm.";
}
window.chupAnhDongHo = chupAnhDongHo;

function chupLai() {
    strClockImageBase64 = "";
    moCamera();
}
window.chupLai = chupLai;

function calculateQ1Score() {
    const yearInput = document.getElementById('ans-year');
    const dayInput = document.getElementById('ans-day');

    const userYear = yearInput ? yearInput.value.trim() : "";
    const userDay = dayInput ? dayInput.value.trim() : "";
    const now = new Date();
    let scoreQ1 = 0;

    // KIỂM TRA NĂM
    if (parseInt(userYear) === now.getFullYear()) {
        scoreQ1++;
    }

    if (parseInt(userDay) === now.getDate()) {
        scoreQ1++;
    }
    console.log("Điểm câu 1:", scoreQ1);
    return scoreQ1;
}

function calculateQ2Score() {
    const city = document.getElementById("q2city").value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const correctCity = city === "hai phong";

    const scoreQ2 = correctCity ? 1 : 0;
    return scoreQ2;
}

function calculateQ4Score() {
    const sub1 = document.getElementById("sub1");
    const sub2 = document.getElementById("sub2");

    if (!sub1 || !sub2) {
        alert("Vui lòng nhập đầy đủ 2 câu trả lời!");
        return;
    }
    let scoreQ4 = 0;

    if (Number(sub1.value) === 155000) {
        scoreQ4++;
    }

    if (Number(sub2.value) === 345000) {
        scoreQ4++;
    }
    return scoreQ4;
}

let scoreQ5 = 0;
let recognitionQ5 = null;
let countdownQ5 = null;
let timeLeftQ5 = 60;
let animalsQ5 = new Set();
let runningQ5 = false;

const danhSachConVatQ5 = [
    "chó", "mèo", "lợn", "heo", "gà", "vịt", "trâu", "bò",
    "ngựa", "dê", "chuột", "voi", "hổ", "báo", "sư tử",
    "khỉ", "rắn", "cá", "chim", "tôm", "cua", "rùa", "thỏ",
    "gấu", "ong", "bướm", "mực", "ếch", "châu chấu", "hươu", "nai", "hươu cao cổ", "tôm tích", "kì nhông", "thằn lằn", "gián", "bọ cạp", "bọ hung", "cào cào", "sâu", "sói"
];

function normalizeAnimalQ5(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
}

function startSpeechRecognition() {
    if (runningQ5) return;

    const SpeechRecognition =
        window.SpeechRecognition || window["webkitSpeechRecognition"];

    if (!SpeechRecognition) {
        alert("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome và cho phép sử dụng micro.");
        return;
    }

    const timer = document.getElementById("timer");
    const button = document.getElementById("actionBtn");
    const transcript = document.getElementById("transcriptDisplay");
    const result = document.getElementById("animalResult");

    if (!timer || !button || !transcript || !result) {
        alert("Không tìm thấy đủ thành phần HTML của Câu 5.");
        return;
    }

    animalsQ5.clear();
    scoreQ5 = 0;
    timeLeftQ5 = 60;
    runningQ5 = true;

    timer.textContent = timeLeftQ5;
    transcript.textContent = "Đang chuẩn bị nghe...";
    result.textContent = "Số con vật hợp lệ: 0";
    button.disabled = true;
    button.textContent = "ĐANG NGHE...";

    playBeepQ5(440, 200);

    recognitionQ5 = new SpeechRecognition();
    recognitionQ5.lang = "vi-VN";
    recognitionQ5.continuous = true;
    recognitionQ5.interimResults = false;

    recognitionQ5.onresult = function (event) {
        let heardText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            heardText += event.results[i][0].transcript + " ";
        }

        transcript.textContent = "Vừa nghe: " + heardText;

        const normalizedText = normalizeAnimalQ5(heardText);

        danhSachConVatQ5.forEach(animal => {
            const normalizedAnimal = normalizeAnimalQ5(animal);

            // Chỉ nhận từ/cụm từ có ranh giới rõ ràng
            const escaped = normalizedAnimal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const pattern = new RegExp("(^|[^a-z])" + escaped + "([^a-z]|$)");

            if (pattern.test(normalizedText)) {
                animalsQ5.add(animal);
            }
        });

        result.textContent =
            "Số con vật hợp lệ nhận diện được: " + animalsQ5.size;
    };

    recognitionQ5.onerror = function () {
        transcript.textContent =
            "Không nhận diện được giọng nói. Hãy kiểm tra quyền micro.";
    };

    recognitionQ5.onend = function () {
        // Một số trình duyệt tự ngắt nhận diện; thử khởi động lại khi còn giờ.
        if (runningQ5) {
            try {
                recognitionQ5.start();
            } catch (error) {
                // Chờ lần kết thúc tiếp theo hoặc hết giờ.
            }
        }
    };

    try {
        recognitionQ5.start();
    } catch (error) {
        runningQ5 = false;
        button.disabled = false;
        button.textContent = "BẮT ĐẦU NÓI";
        transcript.textContent = "Không thể khởi động micro. Hãy thử lại.";
        return;
    }

    countdownQ5 = setInterval(function () {
        timeLeftQ5--;
        timer.textContent = timeLeftQ5;

        if (timeLeftQ5 <= 0) {
            stopSpeechRecognitionQ5();
        }
    }, 1000);
}
window.startSpeechRecognition = startSpeechRecognition;

function stopSpeechRecognitionQ5() {
    if (!runningQ5) return;

    runningQ5 = false;
    clearInterval(countdownQ5);

    if (recognitionQ5) {
        recognitionQ5.onend = null;
        recognitionQ5.stop();
    }

    playBeepQ5(600, 500);

    const button = document.getElementById("actionBtn");
    const transcript = document.getElementById("transcriptDisplay");
    const result = document.getElementById("animalResult");

    const count = animalsQ5.size;
    if (count <= 4) scoreQ5 = 0;
    else if (count <= 9) scoreQ5 = 1;
    else if (count <= 14) scoreQ5 = 2;
    else scoreQ5 = 3;

    button.disabled = false;
    button.textContent = "ĐÃ HOÀN THÀNH";
    transcript.textContent = "Đã kết thúc phần kể tên con vật.";
    result.textContent =
        "Nhận diện được " + count + " tên con vật";

    console.log("Danh sách con vật:", [...animalsQ5]);
}

function playBeepQ5(frequency, duration) {
    try {
        const AudioContextClass =
            window.AudioContext ||
            window["webkitAudioContext"];

        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.15;

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration / 1000);

        oscillator.onended = function () {
            audioCtx.close();
        };
    } catch (error) {
        console.log("Không phát được âm báo.");
    }
}

function calculateQ6Score() {
    const correctObjects = [
        ["tao"],
        ["but"],
        ["cavat"],
        ["nha"],
        ["xe"]
    ];

    const userObjects = [
        "#obj1", "#obj2", "#obj3", "#obj4", "#obj5"].map(id => document.querySelector(id).value);
    function normalizedObject(object) {
        return object
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/\s+/g, "");
    }

    let scoreQ6 = 0;
    const remainingObjects = correctObjects.map(objects => objects.map(normalizedObject));

    userObjects.forEach(object => {
        const answer = normalizedObject(object);

        if (answer === "") return;

        for (let i = 0; i < remainingObjects.length; i++) {
            if (remainingObjects[i].includes(answer)) {
                scoreQ6++;
                remainingObjects.splice(i, 1);
                break;
            }
        }
    });
    return scoreQ6;
}

function calculateQ7Score() {
    let scoreQ7 = 0;

    if (document.getElementById("ans1").value.trim() === "78") {
        scoreQ7++;
    }
    if (document.getElementById("ans2").value.trim() === "946") {
        scoreQ7++;
    }
    if (document.getElementById("ans3").value.trim() === "7358") {
        scoreQ7++;
    }

    return scoreQ7;
}

function normalizeQ10Answer(answer) {
    return answer
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[.,!?;:]/g, " ")
        .replace(/\s+/g, " ");
}

function calculateQ10Score() {
    let scoreQ10 = 0;

    const answer1 = normalizeQ10Answer(
        document.getElementById("q10ans1").value
    );

    const answer2 = normalizeQ10Answer(
        document.getElementById("q10ans2").value
    );

    const answer3 = normalizeQ10Answer(
        document.getElementById("q10ans3").value
    );

    const answer4 = normalizeQ10Answer(
        document.getElementById("q10ans4").value
    );

    if (answer1.includes("lam")) {
        scoreQ10 += 2;
    }

    if (answer2.includes("moi gioi chung khoan") || answer2.includes("chung khoan")) {
        scoreQ10 += 2;
    }

    if (
        answer3.includes("tuoi vi thanh nien") || answer3.includes("vi thanh nien") || answer3.includes("thanh nien") &&
        (
            answer3.includes("con") ||
            answer3.includes("cac con") ||
            answer3.includes("tre")
        )
    ) {
        scoreQ10 += 2;
    }



    if (answer4.includes("tuyen quang")) {
        scoreQ10 += 2;
    }

    return scoreQ10;
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

document.querySelectorAll(".Q7read").forEach((btn, i) => {
    const audio = document.querySelectorAll(".q7audio")[i];

    btn.onclick = () => {
        document.querySelectorAll(".q7audio").forEach(a => {
            if (a !== audio) {
                a.pause();
                a.currentTime = 0;
            }
        });

        if (audio.paused) audio.play();
        else {
            audio.pause();
            audio.currentTime = 0;
        }
    };
});

const q10ReadBtn = document.querySelector(".Q10read");
const q10Audio = document.querySelector(".q10audio");

if (q10ReadBtn && q10Audio) {
    q10ReadBtn.addEventListener("click", () => {
        // Không cho phát lại nếu đã bấm nghe
        if (q10ReadBtn.dataset.played === "true") return;

        // Đánh dấu đã sử dụng lượt nghe
        q10ReadBtn.dataset.played = "true";
        q10ReadBtn.disabled = true;
        q10ReadBtn.textContent = "Đang đọc truyện...";

        q10Audio.play().catch(error => {
            console.error("Lỗi phát MP3:", error);
            q10ReadBtn.textContent = "Không thể phát âm thanh";
        });
    });

    q10Audio.addEventListener("ended", () => {
        q10ReadBtn.textContent = "Đã nghe xong truyện";
    });
}

function kiemTraCau10() {
    const q10 = document.querySelector("#q10ans1")?.closest(".question-card");

    // Nếu không tìm thấy câu 10 thì không kiểm tra
    if (!q10) return true;

    // Chỉ kiểm tra khi câu 10 đang hiển thị
    if (!q10.classList.contains("active")) return true;

    const ids = ["q10ans1", "q10ans2", "q10ans3", "q10ans4"];

    for (const id of ids) {
        const input = q10.querySelector(`#${id}`);

        if (!input || input.value.trim() === "") {
            alert("Vui lòng trả lời đầy đủ 4 ý của câu 10!");

            if (input) input.focus();

            return false;
        }
    }

    return true;
}