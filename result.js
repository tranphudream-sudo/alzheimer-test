import { db } from "./firebase.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const storedUserInfo = sessionStorage.getItem("userInfo");
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : {};

    let finalScore = parseInt(sessionStorage.getItem("score"), 10) || 0;


    const ageMap = {
        "under50": "Dưới 50 tuổi",
        "50-65": "Từ 50 đến dưới 65 tuổi",
        "over65": "Từ 65 tuổi đến 75 tuổi",
        "over75": "Trên 75 tuổi"
    };

    const regionMap = {
        "mien bac": "Miền Bắc",
        "mien trung": "Miền Trung",
        "mien nam": "Miền Nam"
    };

    const eduMap = {
        "non": "Chưa hoàn thành TH hoặc chưa đi học.",
        "primary": "Đã tốt nghiệp TH",
        "middle": "Đã tốt nghiệp THCS",
        "high": "Đã tốt nghiệp THPT",
        "college": "Đã tốt nghiệp ĐH/CĐ (hoặc các bậc học cao hơn)"
    };




    //HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
    const nameEl = document.getElementById("displayName");
    const ageEl = document.getElementById("displayAge");
    const regionEl = document.getElementById("displayRegion");
    const eduEl = document.getElementById("displayEducation") || document.getElementById("displayEdu");

    if (nameEl) nameEl.textContent = userInfo.fullName || "Khách";
    if (ageEl) ageEl.textContent = ageMap[userInfo.age] || userInfo.age || "Chưa chọn";
    if (regionEl) regionEl.textContent = regionMap[userInfo.region] || userInfo.region || "Chưa chọn";
    if (eduEl) eduEl.textContent = eduMap[userInfo.education] || userInfo.education || "Chưa chọn";

    const displayScore = document.getElementById("displayScore");
    if (displayScore) {
        displayScore.textContent = `${finalScore} / 30`;
    }

    const clockStatus = document.getElementById("clockScoreStatus");
    let clockScore = 0;
    let clockGraded = 0;

    async function loadClockScore() {
        if (!clockStatus) return;

        const submissionId = sessionStorage.getItem("clockPublicToken");

        if (!submissionId) {
            clockStatus.textContent =
                "Câu 8: Không tìm thấy mã bài làm. Vui lòng mở lại đúng phiên làm bài.";
            console.warn("Không tìm thấy clockSubmissionId trong sessionStorage.");
            return;
        }

        try {
            const resultRef = doc(db, "clockPublicResults", submissionId);
            const resultSnap = await getDoc(resultRef);

            if (!resultSnap.exists()) {
                clockStatus.textContent =
                    "Câu 8: Không tìm thấy bài làm trên hệ thống.";

                console.warn("Không tìm thấy tài liệu Firestore:", submissionId);
                return;
            }

            const data = resultSnap.data();

            console.log("Dữ liệu chấm đồng hồ:", data);

            // Hỗ trợ cả hai tên trường trạng thái
            const status = data.clockStatus ?? data.status;

            if (
                status === "da_cham" &&
                data.clockScore !== null &&
                data.clockScore !== undefined
            ) {
                clockScore = Number(data.clockScore);

                if (!Number.isFinite(clockScore)) {
                    clockStatus.textContent =
                        "Câu 8: Điểm chấm không hợp lệ.";
                    return;
                }

                clockGraded = true;

                const totalScore = Number(finalScore) + clockScore;

                clockStatus.textContent =
                    `Câu 8: Đã được chấm — ${clockScore}/4 điểm. Tổng điểm: ${totalScore}.`;

                const displayScore = document.getElementById("displayScore");

                if (displayScore) {
                    displayScore.textContent = `${totalScore} / 30`;
                }
            } else {
                clockStatus.textContent =
                    "Câu 8: Bài làm chưa được chấm hoặc chưa có điểm.";

                console.log("Trạng thái:", status);
                console.log("Điểm đồng hồ:", data.clockScore);
            }
        } catch (error) {
            console.error("Lỗi tải điểm đồng hồ:", error);

            clockStatus.textContent =
                "Câu 8: Chưa tải được kết quả chấm. Vui lòng thử lại.";
        }
    }

    loadClockScore();

    let evaluation = "";
    const evalEl = document.getElementById("displayEvaluation");

    if (finalScore >= 24) {
        evaluation = `
            <strong>Nhận thức bình thường:</strong>
            <ul>
            <li>Duy trì đọc sách và các hoạt động rèn luyện trí nhớ.</li>
            <li>Duy trì hoạt động thể chất.</li>
            <li>Ngủ nghỉ và sinh hoạt điều độ.</li>
            <li>Duy trì giao tiếp và các hoạt động xã hội.</li>
            </ul>
            `;
        evalEl.style.color = "#2e7d32";
    } else if (finalScore >= 19) {
        evaluation = `
            <strong>Có dấu hiệu cần theo dõi:</strong>
            <ul>
            <li>Chú ý đến những thay đổi về thay đổi về trí nhớ, khả năng tập trung và xử lí thông tin.</li>
            <li>Tăng cường các hoạt động nhận thức.</li>
            <li>Duy trì giao tiếp với gia đình, bạn bè và cộng đồng.</li>
            <li>Theo dõi sự thay đổi của các biểu hiện theo thời gian.</li>
            <li>Có thể thực hiện bài test định kỳ sau 6 tháng.</li>
            </ul>
            `;
        evalEl.style.color = "#ef6c00";
    } else if (finalScore >= 10) {
        evaluation = `
            <strong>Nguy cơ suy giảm nhận thức:</strong>
            <ul>
            <li>Nên trao đổi với người thân về những thay đổi nhận thức nhận thấy.</li>
            <li>Khuyến khích thực hiện đánh giá nhận thức chuyên sâu tại cơ sở y tế.</li>
            <li>Ghi lại những biểu hiện bất thường trong trí nhớ và nhận thức hàng ngày.</li>
            <li>Tiếp tục duy trì hoạt động thể chất, tinh thần và xã hội phù hợp.</li>
            </ul>
            `;
        evalEl.style.color = "#c62828";
    } else {
        evaluation = `
            <strong>Nguy cơ suy giảm nhận thức cao - Nên được đánh giá chuyên môn:</strong>
            <ul>
            <li>Nên đến cơ sở y tế hoặc trao đổi với bác sĩ để được đánh giá chuyên môn.</li>
            <li>Cung cấp cho nhân viên y tế những biểu hiện nhận thức và thay đổi trong sinh hoạt gần đây.</li>
            <li>Không tự kết luận Alzheimer dựa trên kết quả sàng lọc.</li>
            <li>Thực hiện các hướng dẫn tiếp theo của nhân viên y tế.</li>
            </ul>
            `;
        evalEl.style.color = "#160c0c";
    }


    evalEl.innerHTML = evaluation;
});