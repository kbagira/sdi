
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("username").value.trim(); 
    const password = document.getElementById("password").value.trim();
    const role = document.querySelector('input[name="role"]:checked').value; 

    if (!id || !password) {
        alert("Please enter ID and password");
        return;
    }

    const url = role === "admin"
        ? "http://localhost:3000/api/admin/login"
        : "http://localhost:3000/api/login";

    const body = role === "admin"
        ? { admin_id: id, password }
        : { studentNumber: id, password };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Login failed");
            return;
        }

        if (role === "admin") {
            localStorage.setItem("currentAdmin", JSON.stringify(data.admin));
            window.location.href = "./pages/admin.html";
        } else {
            localStorage.setItem("currentStudent", JSON.stringify(data.student));
            window.location.href = "./pages/profile.html";
        }

    } catch (err) {
        console.error("Login error:", err);
        alert("Server error, try again later");
    }
});






