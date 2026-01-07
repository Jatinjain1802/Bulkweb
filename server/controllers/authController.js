import pool from '../config/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    // In a real app, compare hashed passwords. 
    // For this demo with provided dummy creds, we might be storing plain text or simple check.
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: "dummy_jwt_token_" + user.id 
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
