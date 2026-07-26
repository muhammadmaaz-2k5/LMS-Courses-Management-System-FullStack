import { Webhook } from "svix";
import Stripe from "stripe";
import supabase from "../configs/supabase.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (webhookSecret) {
            const whook = new Webhook(webhookSecret);
            const payload = JSON.stringify(req.body);

            await whook.verify(payload, {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
        } else {
            console.warn("CLERK_WEBHOOK_SECRET not set - skipping webhook verification")
        }

        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const userData = {
                    id: data.id,
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: ((data.first_name || "") + " " + (data.last_name || "")).trim(),
                    role: 'user',
                    image_url: data.image_url || "",
                    enrolled_courses: []
                };

                const { error } = await supabase
                    .from('users')
                    .upsert(userData, { onConflict: 'id' })

                if (error) {
                    console.error("Error creating user:", error.message)
                }
                return res.json({});
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || "",
                    name: (data.first_name || "") + " " + (data.last_name || ""),
                    image_url: data.image_url || "",
                };

                const { error } = await supabase
                    .from('users')
                    .update(userData)
                    .eq('id', data.id)

                if (error) {
                    console.error("Error updating user:", error.message)
                }
                return res.json({});
            }

            case 'user.deleted': {
                const { error } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', data.id)

                if (error) {
                    console.error("Error deleting user:", error.message)
                }
                return res.json({});
            }

            default:
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

const stripeInstance = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const stripeWebhooks = async (request, response) => {
    if (!stripeInstance) {
        return response.status(400).json({ success: false, message: 'Stripe not configured' })
    }

    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!session.data.length) {
                console.error("No session data found for payment intent:", paymentIntentId);
                return;
            }

            const { purchaseId } = session.data[0].metadata;

            // Get purchase data
            const { data: purchaseData, error: purchaseError } = await supabase
                .from('purchases')
                .select('*')
                .eq('id', purchaseId)
                .single()

            if (purchaseError || !purchaseData) {
                console.error("No purchase found for ID:", purchaseId);
                return;
            }

            // Get user data
            const { data: userData } = await supabase
                .from('users')
                .select('enrolled_courses')
                .eq('id', purchaseData.user_id)
                .single()

            // Get course data
            const { data: courseData } = await supabase
                .from('courses')
                .select('enrolled_students')
                .eq('id', purchaseData.course_id)
                .single()

            if (!userData || !courseData) {
                console.error("User or Course not found");
                return;
            }

            // Add user to enrolled students
            const updatedStudents = [...(courseData.enrolled_students || []), purchaseData.user_id]
            await supabase
                .from('courses')
                .update({ enrolled_students: updatedStudents })
                .eq('id', purchaseData.course_id)

            // Add course to user's enrolled courses
            const updatedCourses = [...(userData.enrolled_courses || []), purchaseData.course_id]
            await supabase
                .from('users')
                .update({ enrolled_courses: updatedCourses })
                .eq('id', purchaseData.user_id)

            // Update purchase status
            await supabase
                .from('purchases')
                .update({ status: 'completed' })
                .eq('id', purchaseId)

        } catch (error) {
            console.error("Error handling payment success:", error);
        }
    };

    const handlePaymentFailed = async (paymentIntent) => {
        try {
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!session.data.length) {
                console.error("No session data found for failed payment intent:", paymentIntentId);
                return;
            }

            const { purchaseId } = session.data[0].metadata;

            await supabase
                .from('purchases')
                .update({ status: 'failed' })
                .eq('id', purchaseId)

        } catch (error) {
            console.error("Error handling payment failure:", error);
        }
    };

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
};
