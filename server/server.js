import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import testRouter from './routes/testRoutes.js';

// initialize express 
const app = express();

// connect to Cloudinary
await connectCloudinay();

// middleware
app.use(cors({ credentials: true, exposedHeaders: ['Authorization'] }));
app.use(clerkMiddleware())


// Routes
app.get('/', (req, res) => { res.send("Maaz API is working fine!") })
app.get('/debug/auth', (req, res) => {
    res.json({
        hasAuth: !!req.auth,
        userId: req.auth?.userId || null,
        sessionId: req.auth?.sessionId || null,
        secretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0,
        publishableKeyLength: process.env.CLERK_PUBLISHABLE_KEY?.length || 0,
    })
})
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use('/api/test', express.json(), testRouter);

// Stripe webhook (only if Stripe is configured)
if (process.env.STRIPE_SECRET_KEY) {
    app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);
    console.log('Stripe webhook registered');
} else {
    console.log('Stripe not configured - payments disabled');
}



// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);

})
