const express = require("express");
const cors = require("cors");
const pool = require("./db"); 

const app = express();


app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.url}`);
    next();
});


app.get("/", (req, res) => {
    res.send("Server is running! API is at /api/...");
});


app.post("/api/register", async (req, res) => {
    const {
        studentNumber,
        firstName,
        lastName,
        faculty,
        groupName,
        enrollmentYear,
        program,
        password
    } = req.body;

    if (!studentNumber || !firstName || !lastName || !faculty || !groupName || !enrollmentYear || !program || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const exists = await pool.query(
            "SELECT * FROM students WHERE university_id = $1",
            [studentNumber]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Student number already registered" });
        }

    
        const result = await pool.query(`
            INSERT INTO students 
            (university_id, first_name, last_name, faculty, group_name, enrollment_year, program, password)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
        `, [studentNumber, firstName, lastName, faculty, groupName, enrollmentYear, program, password]);

        const student = result.rows[0];
        delete student.password;

        res.json({ success: true, student });

    } catch (err) {
        console.error(" Register error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



app.post("/api/login", async (req, res) => {
    const { studentNumber, password } = req.body;
    if (!studentNumber || !password) {
        return res.status(400).json({ success: false, message: "Student number and password required" });
    }

    try {
        const result = await pool.query(`
            SELECT s.*, COALESCE(w.score,0) AS total_coins
            FROM students s
            LEFT JOIN wallets w ON s.student_id = w.student_id
            WHERE s.university_id = $1 AND s.password = $2
        `, [studentNumber, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Incorrect student number or password" });
        }

        const student = result.rows[0];
        delete student.password;

        res.json({ success: true, student });
    } catch (err) {
        console.error(" Login error:", err);
        res.status(500).json({ success: false });
    }
});

app.post("/api/admin/login", async (req, res) => {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
        return res.status(400).json({ success: false, message: "Admin ID and password required" });
    }

    try {
        const result = await pool.query(`
            SELECT * FROM admins
            WHERE admin_id = $1 AND password = $2
        `, [admin_id, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Incorrect admin ID or password" });
        }

        const admin = result.rows[0];
        delete admin.password;

        res.json({ success: true, admin });
    } catch (err) {
        console.error(" Admin login error:", err);
        res.status(500).json({ success: false });
    }
});


app.get("/api/students", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, COALESCE(w.score, 0) AS total_coins
            FROM students s
            LEFT JOIN wallets w ON s.student_id = w.student_id
            ORDER BY total_coins DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


app.post("/api/achievements", async (req, res) => {
    const { student_id, category, subcategory, description, pinned_link } = req.body;
    if (!student_id || !category || !description) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const result = await pool.query(`
            INSERT INTO achievements (student_id, category, subcategory, description, pinned_link, status, coins)
            VALUES ($1, $2, $3, $4, $5, 'Pending', 0)
            RETURNING *
        `, [student_id, category, subcategory, description, pinned_link || null]);

        res.json({ success: true, achievement: result.rows[0] });
    } catch (err) {
        console.error(" Add achievement error:", err);
        res.status(500).json({ success: false });
    }
});


app.get("/api/achievements/student/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await pool.query(`
            SELECT *
            FROM achievements
            WHERE student_id = $1
            ORDER BY created_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Get achievements error:", err);
        res.status(500).json({ message: "DB error" });
    }
});


app.get("/api/requests", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.achievement_id,
                s.student_id,
                s.university_id,
                s.first_name || ' ' || s.last_name AS student_name,
                s.group_name AS student_group,
                s.faculty,
                s.program,
                a.category,
                a.subcategory,
                a.description,
                a.coins,
                a.status,
                a.pinned_link
            FROM achievements a
            JOIN students s ON s.student_id = a.student_id
            WHERE a.status = 'Pending'
            ORDER BY a.created_at ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(" Admin requests error:", err);
        res.status(500).json({ message: "DB error" });
    }
});


app.patch("/api/achievements/:id", async (req, res) => {
    const { id } = req.params;
    const { status, coins } = req.body;

    try {
        const achievementResult = await pool.query(`
            UPDATE achievements
            SET status = $1, coins = $2
            WHERE achievement_id = $3
            RETURNING *
        `, [status, coins || 0, id]);

        if (achievementResult.rows.length === 0) return res.status(404).json({ message: "Achievement not found" });

        const achievement = achievementResult.rows[0];

        if (status === "Accepted" && coins > 0) {
            await pool.query(`
                UPDATE wallets
                SET score = score + $1
                WHERE student_id = $2
            `, [coins, achievement.student_id]);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Update achievement error:", err);
        res.status(500).json({ message: "DB error" });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`✅ Student Login: POST /api/login`);
    console.log(`✅ Admin Login: POST /api/admin/login`);
    console.log(`✅ Achievements: POST /api/achievements`);
    console.log(`✅ Profile: GET /api/achievements/student/:id`);
    console.log(`✅ Admin Requests: GET /api/requests`);
    console.log("-----------------------------------------");
});


