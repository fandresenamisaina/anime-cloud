"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const db_1 = require("../config/db");
const adminMiddleware = async (req, res, next) => {
    try {
        const result = await db_1.pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            return res
                .status(403)
                .json({ message: "Acces reserve aux administrateurs" });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Erreur lors de la verification des droits" });
    }
};
exports.adminMiddleware = adminMiddleware;
