from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .webhook_handler import StripeWH_Handler
import stripe


# @require_POST
# @csrf_exempt
# def webhook(request):
#     wh_secret = settings.STRIPE_WH_SECRET
#     print(wh_secret)
#     stripe.api_key = settings.STRIPE_SECRET_KEY
#     print(settings.STRIPE_SECRET_KEY)
#     payload = request.body
#     print(payload)
#     sig_header = request.META['HTTP_STRIPE_SIGNATURE']
#     print(sig_header)
#     event = None

#     try:
#         event = stripe.Webhook.construct_event(
#             payload, sig_header, wh_secret
#     )
#     except ValueError as e:
#         # Invalid payload
#         print("INVALID PAYLOAD")
#         return HttpResponse(content=e, status=400)
#     except stripe.error.SignatureVerificationError as e:
#         # Invalid signature
#         print("INVALID SIGNATURE")
#         return HttpResponse(content=e, status=400)
#     # Handle the event
#     if event.type == 'payment_intent.succeeded':
#         payment_intent = event.data.object # contains a stripe.PaymentIntent
#         print('PaymentIntent was successful!')
#     elif event.type == 'payment_method.attached':
#         payment_method = event.data.object # contains a stripe.PaymentMethod
#         print('PaymentMethod was attached to a Customer!')
#     # ... handle other event types
#     else:
#         print('Unhandled event type {}'.format(event.type))

#     return HttpResponse(status=200)

@require_POST
@csrf_exempt
def webhook(request):
    """Listen for events"""
    wh_secret = settings.STRIPE_WH_SECRET
    stripe.api_key = settings.STRIPE_SECRET_KEY
    #  Get thet webhook data and verify its signature
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, wh_secret
            )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(content=e, status=400)
    except Exception as e:
        return HttpResponse(content=e, status=400)

    # Set up a webhook handler
    handler = StripeWH_Handler(request)

    # Map webhook events to releveant handler functions
    event_map = {
        'payment_intent.succeeded': handler.handle_payment_intent_succeeded,
        'payment_intent.payment_failed': handler.handle_payment_intent_payment_failed,
    }

    # Get the webhook type from Stripe
    event_type = event['type']
    print("EVENT TYPE: ", event_type)
    event_handler = event_map.get(event_type, handler.handle_event)

    response = event_handler(event)
    return response
