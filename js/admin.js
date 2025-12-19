function fillAdminHeader(admin) {

    document.querySelector(".profile__name").textContent = admin.full_name; 
    document.querySelector(".profile__id-num").textContent = admin.admin_id; 
    document.querySelector(".profile__role-name").textContent = admin.role || "Admin"; 
   document.querySelector(".profile__header-name").textContent =admin.full_name;
    const facultyEl = document.querySelector(".profile__faculty");
    const facultyNameEl = document.querySelector(".profile__faculty-name");
    const programEl = document.querySelector(".profile__program");
    const programNameEl = document.querySelector(".profile__program-name");

    if (facultyEl) facultyEl.style.display = "none";
    if (facultyNameEl) facultyNameEl.style.display = "none";
    if (programEl) programEl.style.display = "none";
    if (programNameEl) programNameEl.style.display = "none";
}


document.addEventListener("DOMContentLoaded", () => {
    const adminStr = localStorage.getItem("currentAdmin");
    if (!adminStr) {
        alert("Admin not logged in");
        window.location.href = "../login.html";
        return;
    }

    const admin = JSON.parse(adminStr);
    fillAdminHeader(admin);

    loadRequests();
});




document.addEventListener("DOMContentLoaded", loadRequests);

async function loadRequests() {
    try {
        const res = await fetch("http://localhost:3000/api/requests");
        const requests = await res.json();
        console.log(requests); 
        renderRequests(requests);
    } catch (err) {
        console.error(" Fetch error:", err);
    }
}

function renderRequests(requests) {
    const tableBody = document.getElementById("requests-table");
    tableBody.innerHTML = "";

    requests.forEach(req => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${req.achievement_id}</td>
            <td>${req.university_id}</td>
            <td>${req.student_name}</td>
            <td>${req.student_group}</td>
            <td>${req.description}</td>
            <td>${req.coins}</td>
        `;
        row.addEventListener("click", () => openRequestBox(req));
        tableBody.appendChild(row);
    });
}


function openRequestBox(req) {
    const modal = document.getElementById("modal-bg");
    modal.classList.remove("hidden");

  document.querySelector(".student-name").textContent = req.student_name;
document.querySelector(".id").textContent = req.university_id;
document.querySelector(".group").textContent = req.student_group;
document.querySelector(".faculty").textContent = req.faculty || '';
document.querySelector(".program").textContent = req.program || '';
document.querySelector(".description").textContent = req.description || '';
document.querySelector(".category").textContent = req.category || '';
document.querySelector(".subcategory").textContent = req.subcategory || '';
document.querySelector(".coins").textContent = req.coins;

const statusEl = document.querySelector(".status");
statusEl.textContent = req.status;
statusEl.style.color = req.status === "Accepted" ? "green" 
                    : req.status === "Rejected" ? "red" 
                    : "orange"; 

    const link = document.querySelector(".pinned-link");
    if (req.pinned_link) {
        link.textContent = req.pinned_link;
        link.href = req.pinned_link;
    } else {
        link.textContent = "No link";
        link.removeAttribute("href");
    }

    document.querySelector(".accept").onclick = () => updateRequest(req.achievement_id, "Accepted", 10);
    document.querySelector(".reject").onclick = () => updateRequest(req.achievement_id, "Rejected", 0);
    document.querySelector(".remake").onclick = () => updateRequest(req.achievement_id, "Remake", 0);
}

function closeRequestBox() {
    document.getElementById("modal-bg").classList.add("hidden");
}

document.getElementById("modal-bg").addEventListener("click", e => {
    const box = document.getElementById("request-box");
    if (!box.contains(e.target)) closeRequestBox();
});


async function updateRequest(id, status, coins) {
    try {
        await fetch(`http://localhost:3000/api/achievements/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, coins })
        });

        alert(`Request ${status.toLowerCase()}!`);
        closeRequestBox();
        loadRequests(); 
    } catch (err) {
        console.error(" Update request error:", err);
        alert("Server error");
    }
}

