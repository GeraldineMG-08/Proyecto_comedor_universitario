const pool = require('../config/db');

class ReporteModel {
    static async getPeriodosDisponibles() {
        const query = `
            SELECT DISTINCT TO_CHAR(fecha, 'YYYY-MM') as valor,
                   TO_CHAR(fecha, 'MM') as mes,
                   TO_CHAR(fecha, 'YYYY') as anio
            FROM menus
            ORDER BY valor DESC
        `;
        const { rows } = await pool.query(query);

        const mesesES = {
            '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
            '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
            '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
        };

        return rows.map(row => {
            const nombreMes = mesesES[row.mes] || 'Mes';
            return {
                value: row.valor,
                label: `${nombreMes} ${row.anio}`
            };
        });
    }

    static async getKPIs(periodo) {
        // total_menus publicados en el periodo
        const menusQuery = `
            SELECT COUNT(*) as total
            FROM menus
            WHERE TO_CHAR(fecha, 'YYYY-MM') = $1 AND estado = 'publicado'
        `;
        const menusRes = await pool.query(menusQuery, [periodo]);
        const totalMenus = parseInt(menusRes.rows[0].total || 0);

        // total restricciones activas
        const restrictionsQuery = `
            SELECT COUNT(*) as total
            FROM restricciones_alimentarias
            WHERE estado = 'activo'
        `;
        const restrictionsRes = await pool.query(restrictionsQuery);
        const totalRestricciones = parseInt(restrictionsRes.rows[0].total || 0);

        // promedio calórico de los menús publicados en el periodo
        const avgQuery = `
            SELECT AVG(total_kcal) as promedio
            FROM menus
            WHERE TO_CHAR(fecha, 'YYYY-MM') = $1 AND estado = 'publicado'
        `;
        const avgRes = await pool.query(avgQuery, [periodo]);
        const avgCalorico = Math.round(parseFloat(avgRes.rows[0].promedio || 0));

        // total becarios activos
        const becariosQuery = `
            SELECT COUNT(*) as total
            FROM becarios
            WHERE estado = 'activo'
        `;
        const becariosRes = await pool.query(becariosQuery);
        const totalBecarios = parseInt(becariosRes.rows[0].total || 0);

        // Licenciado responsable (nutricionista - usuario 2)
        const respQuery = `
            SELECT CONCAT(nombres, ' ', apellidos) as nombre_completo, cargo
            FROM personal_administrativo
            WHERE id_usuario = 2
            LIMIT 1
        `;
        const respRes = await pool.query(respQuery);
        const respData = respRes.rows[0];

        const responsable = respData ? respData.nombre_completo : 'Lic. Nutricionista';
        const cargo = respData ? respData.cargo : 'Área de Nutrición';

        return {
            total_menus: totalMenus,
            total_restricciones: totalRestricciones,
            promedio_calorico: avgCalorico,
            total_becarios: totalBecarios,
            responsable_nombre: responsable,
            responsable_cargo: cargo
        };
    }

    static async getChartCalorias(periodo) {
        // average calories grouped by service (Desayuno, Almuerzo, Cena)
        // using the table 'detalles_menu' joined with 'menus' and 'tipos_servicios'
        const query = `
            SELECT
                ts.nombre as label,
                ROUND(AVG(sub.total_cal)) as value
            FROM (
                SELECT dm.id_menu, dm.id_tipo_servicio, SUM(dm.calorias_kcal) as total_cal
                FROM detalles_menu dm
                INNER JOIN menus m ON dm.id_menu = m.id
                WHERE TO_CHAR(m.fecha, 'YYYY-MM') = $1 AND m.estado = 'publicado'
                GROUP BY dm.id_menu, dm.id_tipo_servicio
            ) sub
            INNER JOIN tipos_servicios ts ON sub.id_tipo_servicio = ts.id
            GROUP BY ts.id, ts.nombre
            ORDER BY ts.id
        `;
        const { rows } = await pool.query(query, [periodo]);

        const colores = {
            'Desayuno': '#38bdf8',
            'Almuerzo': '#2563eb',
            'Cena': '#6366f1'
        };

        return rows.map(row => ({
            label: row.label,
            value: parseInt(row.value || 0),
            color: colores[row.label] || '#cbd5e1'
        }));
    }

    static async getChartRestricciones() {
        const query = `
            SELECT
                tr.nombre as label,
                COUNT(ra.id) as count
            FROM tipos_restricciones tr
            LEFT JOIN restricciones_alimentarias ra ON tr.id = ra.id_tipo_restriccion AND ra.estado = 'activo'
            GROUP BY tr.id, tr.nombre
            ORDER BY count DESC
        `;
        const { rows } = await pool.query(query);

        return rows.map(row => {
            const count = parseInt(row.count || 0);
            const labelLower = row.label.toLowerCase();
            let color = '#cbd5e1';
            if (labelLower.includes('alergia')) color = '#3b82f6';
            else if (labelLower.includes('intolerancia')) color = '#0ea5e9';
            else if (labelLower.includes('diabetes')) color = '#64748b';
            else if (labelLower.includes('vegetariano')) color = '#94a3b8';

            return {
                label: row.label,
                count,
                color
            };
        });
    }

    static async getTablaMenus(periodo) {
        const query = `
            SELECT id, fecha::text as fecha, total_kcal
            FROM menus
            WHERE TO_CHAR(fecha, 'YYYY-MM') = $1 AND estado = 'publicado'
            ORDER BY fecha ASC
        `;
        const { rows: menus } = await pool.query(query, [periodo]);

        const diasMap = {
            'Sunday': 'Dom', 'Monday': 'Lun', 'Tuesday': 'Mar', 'Wednesday': 'Mié', 'Thursday': 'Jue', 'Friday': 'Vie', 'Saturday': 'Sáb'
        };

        const resultado = [];

        for (const menu of menus) {
            const fechaObj = new Date(menu.fecha + 'T00:00:00');
            const dayNameEn = fechaObj.toLocaleDateString('en-US', { weekday: 'long' });
            const nombreDia = diasMap[dayNameEn] || 'Día';

            // Fetch details for each service
            const detailsQuery = `
                SELECT dm.nombre_plato, dm.calorias_kcal as calorias, ts.nombre as servicio
                FROM detalles_menu dm
                JOIN tipos_servicios ts ON dm.id_tipo_servicio = ts.id
                WHERE dm.id_menu = $1
            `;
            const { rows: detalles } = await pool.query(detailsQuery, [menu.id]);

            const servicios = {
                'Desayuno': { items: [], kcal: 0 },
                'Almuerzo': { items: [], kcal: 0 },
                'Cena': { items: [], kcal: 0 }
            };

            detalles.forEach(d => {
                if (servicios[d.servicio]) {
                    servicios[d.servicio].items.push(d.nombre_plato);
                    servicios[d.servicio].kcal += parseInt(d.calorias || 0);
                }
            });

            resultado.push({
                fecha: menu.fecha,
                dia: nombreDia,
                desayuno: servicios['Desayuno'],
                almuerzo: servicios['Almuerzo'],
                cena: servicios['Cena'],
                total: menu.total_kcal
            });
        }

        return resultado;
    }

    static async getTablaRestricciones() {
        const query = `
            SELECT
                CONCAT(pe.nombres, ' ', pe.apellido_paterno, ' ', pe.apellido_materno) as nombre_completo,
                pe.codigo_universitario,
                tr.nombre as tipo_restriccion,
                tr.id as id_tipo,
                ra.alimentos_restringidos,
                ra.fecha_inicio::text as fecha_inicio,
                ra.fecha_termino::text as fecha_termino,
                ra.estado
            FROM restricciones_alimentarias ra
            INNER JOIN becarios b ON ra.id_becario = b.id
            INNER JOIN usuarios u ON b.id_usuario = u.id
            INNER JOIN padron_estudiantes pe ON u.codigo_usuario = pe.codigo_universitario
            INNER JOIN tipos_restricciones tr ON ra.id_tipo_restriccion = tr.id
            WHERE ra.estado = 'activo'
        `;
        const { rows } = await pool.query(query);

        const colores = {
            1: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
            2: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
            3: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
            4: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
            5: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
        };

        return rows.map(row => {
            const style = colores[row.id_tipo] || colores[5];
            return {
                ...row,
                style
            };
        });
    }
}

module.exports = ReporteModel;
