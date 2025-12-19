const tableBody = document.getElementById("students-table");
const searchInput = document.getElementById("search-input");

let students = []; 

async function loadStudents() {
    try {
        const res = await fetch("http://localhost:3000/api/students");
        students = await res.json();
        applyFilters(); 
    } catch (err) {
        console.error("Ошибка загрузки студентов:", err);
    }
}

function renderStudents(list) {
    tableBody.innerHTML = "";

    const sorted = [...list].sort((a, b) => b.total_coins - a.total_coins);

    sorted.forEach((s, index) => {
        const tr = document.createElement("tr");
        tr.onclick = () => {
            window.location.href = "../pages/profile.html?id=" + s.student_id;
        };

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${s.university_id}</td>
            <td>${s.first_name} ${s.last_name}</td>
            <td>${s.faculty}</td>
            <td>${s.program || ''}</td>
            <td>${s.group_name}</td>
            <td>${s.enrollment_year}</td>
            <td>${s.total_coins}</td>
        `;

        tableBody.appendChild(tr);
    });
}

function applyFilters() {
    const faculty = document.getElementById("filter-faculty").value;
    const group = document.getElementById("filter-group").value;
    const year = document.getElementById("filter-year").value;
    const search = searchInput.value.toLowerCase();

    let filtered = students;

    if (faculty) filtered = filtered.filter(s => s.faculty === faculty);
    if (group) filtered = filtered.filter(s => s.group_name === group);
    if (year) filtered = filtered.filter(s => String(s.enrollment_year) === year);

    if (search.trim() !== "") {
        filtered = filtered.filter(s => {
            const fullName = (s.first_name + " " + s.last_name).toLowerCase();
            const first = s.first_name.toLowerCase();
            const last = s.last_name.toLowerCase();
            const id = s.university_id.toLowerCase();
            const program = (s.program || '').toLowerCase();

            return (
                fullName.includes(search) ||
                first.includes(search) ||
                last.includes(search) ||
                id.includes(search) ||
                program.includes(search)
            );
        });
    }

    renderStudents(filtered);
}

document.getElementById("filter-faculty").addEventListener("change", applyFilters);
document.getElementById("filter-group").addEventListener("change", applyFilters);
document.getElementById("filter-year").addEventListener("change", applyFilters);

searchInput.addEventListener("input", applyFilters);

loadStudents();

