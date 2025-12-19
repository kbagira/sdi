const categories = {
    hackathon: ["1st Place", "2nd Place", "3rd Place", "Winner", "Participation", "Others"],
    awards: ["1st Place", "2nd Place", "3rd Place", "Winner", "Participation Certificate", "Others"],
    volunteering: ["Community Service", "Environmental Clean-up", "Event Support", "Others"],
    exchange: ["Exchange Program", "Dual Degree Program", "Others"],
    event: ["Organization", "Speech / Presentation", "Participant", "Others"],
    sports: ["Football", "Basketball", "Swimming", "Others"],
    conference: ["International", "National", "Local", "Others"],
    patent: ["Patent Granted", "Patent Filed", "Others"],
    project: ["Research Project", "Team Project", "Independent Project", "Others"],
    competition: ["Others"]
};


function fillFormFromProfile() {
    const student = JSON.parse(localStorage.getItem("currentStudent"));
    if (!student) {
        window.location.href = "../index.html";
        return;
    }

    document.getElementById("fullname").value =
        `${student.first_name} ${student.last_name}`;
    document.getElementById("faculty").value = student.faculty || "";
    document.getElementById("program").value = student.program || "";
    document.getElementById("studentId").value = student.university_id || "";
}


function setupCategorySelect() {
    const categorySelect = document.getElementById("category");
    const subcategorySelect = document.getElementById("subcategory");

    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.id = "otherSubcategory";
    otherInput.className = "achivement__input";
    otherInput.placeholder = "Specify other subcategory";
    otherInput.style.display = "none";

    subcategorySelect.parentNode.appendChild(otherInput);

    categorySelect.addEventListener("change", () => {
        const subs = categories[categorySelect.value] || [];
        subcategorySelect.innerHTML =
            `<option disabled selected>Select subcategory</option>`;

        subs.forEach(sub => {
            const opt = document.createElement("option");
            opt.value = sub;
            opt.textContent = sub;
            subcategorySelect.appendChild(opt);
        });

        otherInput.style.display = "none";
        otherInput.required = false;
    });

    subcategorySelect.addEventListener("change", () => {
        if (subcategorySelect.value === "Others") {
            otherInput.style.display = "block";
            otherInput.required = true;
        } else {
            otherInput.style.display = "none";
            otherInput.required = false;
        }
    });
}


async function submitAchievement(e) {
    e.preventDefault();

    const student = JSON.parse(localStorage.getItem("currentStudent"));
    if (!student) return;

    const category = document.getElementById("category").value;
    let subcategory = document.getElementById("subcategory").value;

    if (subcategory === "Others") {
        subcategory = document.getElementById("otherSubcategory").value.trim();
    }

    const description = document.getElementById("description").value;
    const pinned_link = document.getElementById("pinnedLink")?.value || null;

    try {
        const response = await fetch("http://127.0.0.1:3000/api/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: student.student_id,
                category,
                subcategory,
                description,
                pinned_link
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert("Error submitting achievement");
            return;
        }

        alert("Achievement submitted! Status: Pending");
        window.location.href = "./profile.html";

    } catch (err) {
        console.error("Submit error:", err);
        alert("Server error");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    fillFormFromProfile();
    setupCategorySelect();

    const form = document.querySelector(".achivement__form");
    form.addEventListener("submit", submitAchievement);
});
achievements.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${a.description}</td>
        <td>${a.category}${a.subcategory ? " / " + a.subcategory : ""}</td>
        <td class="status">${a.status}</td>
        <td>${a.coins}</td>
    `;
    
    const statusTd = tr.querySelector(".status");
    if (a.status === "Pending") statusTd.style.color = "orange";
    else if (a.status === "Accepted") statusTd.style.color = "green";
    else if (a.status === "Rejected") statusTd.style.color = "red";

    tableBody.appendChild(tr);
});



