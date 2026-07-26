const pool = require('../config/db');

class MenuModel {
    static async getCalendarStatus(month) {
        const query = `
            SELECT fecha::text, estado
            FROM menus
            WHERE TO_CHAR(fecha, 'YYYY-MM') = $1
        `;
        const { rows } = await pool.query(query, [month]);

        // Convert to an object: { '2026-07-01': 'publicado', ... }
        const statusMap = {};
        rows.forEach(row => {
            statusMap[row.fecha] = row.estado;
        });
        return statusMap;
    }

    static async getMenuByDate(date) {
        const query = `
            SELECT id, fecha::text, estado, total_kcal, id_usuario_registra
            FROM menus
            WHERE fecha = $1
        `;
        const { rows } = await pool.query(query, [date]);
        return rows[0] || null;
    }

    static async getMenuDetails(menuId) {
        const query = `
            SELECT id_tipo_servicio, id_tipo_componente, nombre_plato, calorias_kcal
            FROM detalles_menu
            WHERE id_menu = $1
        `;
        const { rows } = await pool.query(query, [menuId]);
        return rows;
    }

    static async saveMenu(fecha, estado, totalKcal, userId, servicesData) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check if menu already exists
            const checkQuery = `SELECT id FROM menus WHERE fecha = $1`;
            const checkRes = await client.query(checkQuery, [fecha]);
            let menuId;

            if (checkRes.rows.length > 0) {
                menuId = checkRes.rows[0].id;
                // Update existing menu
                const updateQuery = `
                    UPDATE menus
                    SET estado = $1, total_kcal = $2, id_usuario_registra = $3, fecha_publicacion = CURRENT_TIMESTAMP
                    WHERE id = $4
                `;
                await client.query(updateQuery, [estado, totalKcal, userId, menuId]);

                // Delete existing details
                const deleteDetailsQuery = `DELETE FROM detalles_menu WHERE id_menu = $1`;
                await client.query(deleteDetailsQuery, [menuId]);
            } else {
                // Insert new menu
                const insertQuery = `
                    INSERT INTO menus (fecha, estado, total_kcal, id_usuario_registra, fecha_publicacion)
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                    RETURNING id
                `;
                const insertRes = await client.query(insertQuery, [fecha, estado, totalKcal, userId]);
                menuId = insertRes.rows[0].id;
            }

            // 2. Insert details
            // servicesData: { desayuno: { 1: { plato: '...', kcal: 100 }, ... }, almuerzo: {...}, cena: {...} }
            const serviceMapping = {
                desayuno: 1,
                almuerzo: 2,
                cena: 3
            };

            for (const [serviceName, serviceId] of Object.entries(serviceMapping)) {
                const serviceItems = servicesData[serviceName];
                if (serviceItems && typeof serviceItems === 'object') {
                    for (const [componentIdStr, item] of Object.entries(serviceItems)) {
                        const componentId = parseInt(componentIdStr);
                        if (item && item.plato && item.plato.trim() !== '') {
                            const detailQuery = `
                                INSERT INTO detalles_menu (id_menu, id_tipo_servicio, id_tipo_componente, nombre_plato, calorias_kcal)
                                VALUES ($1, $2, $3, $4, $5)
                            `;
                            await client.query(detailQuery, [
                                menuId,
                                serviceId,
                                componentId,
                                item.plato.trim(),
                                parseInt(item.kcal || 0)
                            ]);
                        }
                    }
                }
            }

            await client.query('COMMIT');
            return menuId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async deleteMenu(fecha) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const getMenuQuery = `SELECT id FROM menus WHERE fecha = $1`;
            const menuRes = await client.query(getMenuQuery, [fecha]);

            if (menuRes.rows.length > 0) {
                const menuId = menuRes.rows[0].id;

                // Delete details first
                await client.query(`DELETE FROM detalles_menu WHERE id_menu = $1`, [menuId]);
                // Delete menu
                await client.query(`DELETE FROM menus WHERE id = $1`, [menuId]);
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = MenuModel;
