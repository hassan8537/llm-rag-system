import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { 
  validateCreateUser, 
  validateUpdateUser, 
  validateIdParam, 
  validateEmailParam 
} from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', validateCreateUser, UserController.createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (requires authentication)
 */
router.get('/', AuthMiddleware.authenticate, UserController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', validateIdParam, UserController.getUserById);

/**
 * @route   GET /api/users/email/:email
 * @desc    Get user by email
 * @access  Public
 */
router.get('/email/:email', validateEmailParam, UserController.getUserByEmail);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Public
 */
router.put('/:id', validateIdParam, validateUpdateUser, UserController.updateUser);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Public
 */
router.patch('/:id/deactivate', validateIdParam, UserController.deactivateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete('/:id', validateIdParam, UserController.deleteUser);

export default router;
