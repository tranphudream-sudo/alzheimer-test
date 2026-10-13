document.addEventListener("DOMContentLoaded", () => {
    //LẤY DỰ LIỆU TỪ STORAGE
    const storedUserInfo = sessionStorage.getItem("userInfo");
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : {};

    const rawScore = parseInt(sessionStorage.getItem("score")) || 0;
    const testType = userInfo.testType || "mmse";
    const education = userInfo.education || "over12";

    //CHUYỂN ĐỔI MÃ VALUE SANG TIẾNG VIỆT HIỂN THỊ
    const ageMap = {
        "under50": "Dưới 50 tuổi",
        "50-65": "Từ 50 đến 65 tuổi",
        "over65": "Trên 65 tuổi"
    };

    const regionMap = {
        "mien bac": "Miền Bắc",
        "mien trung": "Miền Trung",
        "mien nam": "Miền Nam"
    };

    const eduMap = {
        "under12": "Dưới 12 năm",
        "over12": "Trên 12 năm trở lên"
    };

    const testTypeName = {
        "moca": "NT.Chuyên sâu",
        "mmse": "NT.Cơ bản"
    };


    //HIỂN THỊ THÔNG TIN NGƯỜI DÙNG
    const nameEl = document.getElementById("displayName");
    const ageEl = document.getElementById("displayAge");
    const regionEl = document.getElementById("displayRegion");
    const eduEl = document.getElementById("displayEducation") || document.getElementById("displayEdu");
    const testTypeEl = document.getElementById("displayTest");

    if (nameEl) nameEl.textContent = userInfo.fullName || "Khách";
    if (ageEl) ageEl.textContent = ageMap[userInfo.age] || userInfo.age || "Chưa chọn";
    if (regionEl) regionEl.textContent = regionMap[userInfo.region] || userInfo.region || "Chưa chọn";
    if (testTypeEl) testTypeEl.textContent = testTypeName[userInfo.testType] || "Chưa chọn";
    if (eduEl) eduEl.textContent = eduMap[userInfo.education] || userInfo.education || "Chưa chọn";

    //TÍNH ĐIỂM ƯU TIÊN CHO BÀI TEST MOCA. NẾU HỌC VẤN DƯỚI 12 NĂM THÌ CỘNG 1 ĐIỂM
    let finalScore = rawScore;
    const bonusNoteEl = document.getElementById("bonusNote");

    if (testType === "moca" && education === "under12") {
        finalScore = Math.min(30, rawScore + 1); //ĐIỂM TỐI ĐA LÀ 30
        if (bonusNoteEl) bonusNoteEl.textContent = "(Đã cộng +1 điểm ưu tiên MoCA cho trình độ học vấn dưới 12 năm)";
    }

    //HIỂN THỊ ĐIỂM SỐ
    document.getElementById("displayScore").textContent = `${finalScore} / 30`;

    //LOGIC PHÂN LOẠI KẾT QUẢ Y KHOA
    let evaluation = "";
    const evalEl = document.getElementById("displayEvaluation");

    if (testType === "mmse") {
        if (finalScore >= 24) {
            evaluation = `
            <strong>Nhận thức bình thường:</strong>
            <ul>
            <li>Duy trì đọc sách và các hoạt động rèn luyện trí nhớ.</lior>
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
            <li>Chú ý đến những thay đổi về thay đổi về trí nhớ, khả năng tập trung và xử lí thông tin 🐱‍🏍</li>
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
    }

    evalEl.innerHTML = evaluation;
});