import dotenv from 'dotenv';

dotenv.config();

export const checkAdminRole = (req, res, next) => {
    const userRole = process.env.CURRENT_USER;
    const { role } = res.locals;

    if (role === userRole) {
        return res.status(401).json({message: 'Unauthorized - Admin Role Required'});
    } else {
        next();
    }
};