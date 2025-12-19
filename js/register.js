const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentNumber = document.getElementById("studentNumber").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const faculty = document.getElementById("faculty").value.trim();
    const groupName = document.getElementById("groupName").value.trim();
    const enrollmentYear = parseInt(document.getElementById("enrollmentYear").value);
    const program = document.getElementById("program").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentNumber,
                firstName,
                lastName,
                faculty,
                groupName,
                enrollmentYear,
                program,
                password
            })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Registration failed");
            return;
        }

        alert("Registration successful! You can now log in.");
        window.location.href = "../index.html";

    } catch (err) {
        console.error("Registration error:", err);
        alert("Server error. Try again later.");
    }
});

