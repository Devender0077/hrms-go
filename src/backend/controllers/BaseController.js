/**
 * Base Controller Class
 * Provides common CRUD operations and standardized response handling
 */

class BaseController {
  constructor(model, pool) {
    this.model = model;
    this.pool = pool;
  }

  /**
   * Get all records with pagination and filtering
   */
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = 'id',
        order = 'asc',
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;
      const searchFields = this.model.searchFields || ['name'];
      
      // Build search condition
      let searchCondition = '';
      let searchParams = [];
      
      if (search && searchFields.length > 0) {
        const searchClauses = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
        searchCondition = `WHERE ${searchClauses}`;
        searchParams = searchFields.map(() => `%${search}%`);
      }

      // Build filter conditions
      const filterConditions = [];
      const filterParams = [];
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          filterConditions.push(`${key} = ?`);
          filterParams.push(value);
        }
      });

      const whereClause = [searchCondition, filterConditions.join(' AND ')]
        .filter(Boolean)
        .join(' AND ');

      const finalWhere = whereClause ? `WHERE ${whereClause}` : '';
      const allParams = [...searchParams, ...filterParams];

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${this.model.tableName} ${finalWhere}`;
      const [countResult] = await this.pool.query(countQuery, allParams);
      const total = countResult[0].total;

      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${this.model.tableName} 
        ${finalWhere}
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;
      
      const [data] = await this.pool.query(dataQuery, [...allParams, parseInt(limit), offset]);

      res.json({
        success: true,
        data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(`Error fetching ${this.model.tableName}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error fetching data',
        error: error.message
      });
    }
  }

  /**
   * Get single record by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `SELECT * FROM ${this.model.tableName} WHERE id = ?`;
      const [rows] = await this.pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.model.name} not found`
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error(`Error fetching ${this.model.name}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error fetching data',
        error: error.message
      });
    }
  }

  /**
   * Create new record
   */
  async create(req, res) {
    try {
      const data = req.body;
      
      // Validate required fields
      const validation = this.model.validate(data);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Prepare insert data
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map(() => '?').join(', ');

      const query = `
        INSERT INTO ${this.model.tableName} (${fields.join(', ')}) 
        VALUES (${placeholders})
      `;

      const [result] = await this.pool.query(query, values);

      // Get the created record
      const [newRecord] = await this.pool.query(
        `SELECT * FROM ${this.model.tableName} WHERE id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: `${this.model.name} created successfully`,
        data: newRecord[0]
      });
    } catch (error) {
      console.error(`Error creating ${this.model.name}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error creating data',
        error: error.message
      });
    }
  }

  /**
   * Update record by ID
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if record exists
      const [existing] = await this.pool.query(
        `SELECT * FROM ${this.model.tableName} WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.model.name} not found`
        });
      }

      // Validate data
      const validation = this.model.validate(data, true);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Prepare update data
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      const query = `
        UPDATE ${this.model.tableName} 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.pool.query(query, [...values, id]);

      // Get updated record
      const [updatedRecord] = await this.pool.query(
        `SELECT * FROM ${this.model.tableName} WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: `${this.model.name} updated successfully`,
        data: updatedRecord[0]
      });
    } catch (error) {
      console.error(`Error updating ${this.model.name}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error updating data',
        error: error.message
      });
    }
  }

  /**
   * Delete record by ID
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if record exists
      const [existing] = await this.pool.query(
        `SELECT * FROM ${this.model.tableName} WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: `${this.model.name} not found`
        });
      }

      // Delete record
      await this.pool.query(
        `DELETE FROM ${this.model.tableName} WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        message: `${this.model.name} deleted successfully`
      });
    } catch (error) {
      console.error(`Error deleting ${this.model.name}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error deleting data',
        error: error.message
      });
    }
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IDs provided'
        });
      }

      const placeholders = ids.map(() => '?').join(', ');
      const query = `DELETE FROM ${this.model.tableName} WHERE id IN (${placeholders})`;

      const [result] = await this.pool.query(query, ids);

      res.json({
        success: true,
        message: `${result.affectedRows} ${this.model.name}(s) deleted successfully`
      });
    } catch (error) {
      console.error(`Error bulk deleting ${this.model.name}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error deleting data',
        error: error.message
      });
    }
  }
}

module.exports = BaseController;

