import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

// initialize express 
const app = express();

// connect to Cloudinary
await connectCloudinay();

// middleware
app.use(cors());
app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}))


// Routes
app.get('/', (req, res) => { res.send("Maaz API is working fine!") })
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);

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
