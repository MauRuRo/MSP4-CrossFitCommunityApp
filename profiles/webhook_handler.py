from django.http import HttpResponse
from .views import createDefaultHeroLevels
from .models import UserProfile
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import json
import time
from datetime import datetime, date, timedelta


class StripeWH_Handler:
    """Handle Stripe webhooks"""

    def __init__(self, request):
        self.request = request

    # def _send_confirmation_email(self, order):
    #     """ Send th user confirmation email"""
    #     cust_email = order.email
    #     subject = render_to_string(
    #         'checkout/confirmation_emails/confirmation_email_subject.txt',
    #         {'order': order})
    #     body = render_to_string(
    #         'checkout/confirmation_emails/confirmation_email_body.txt',
    #         {'order': order, 'contact_email': settings.DEFAULT_FROM_EMAIL})
    #     send_mail(
    #         subject,
    #         body,
    #         settings.DEFAULT_FROM_EMAIL,
    #         [cust_email]
    #     )


    def handle_event(self, event):
        """
        Handle a generic/unknown/unexpected webhook event
        """
        return HttpResponse(
            content=f'Unhandled webhook received: {event["type"]}',
            status=200)

    def handle_payment_intent_succeeded(self, event):
        """
        Handle the payment_intent.succeeded webhook from Stripe
        """
        intent = event.data.object
        pid = intent.id
        print("THIS IS THE METADATA: ", intent.metadata)
        userprofile = intent.metadata
        birthdate = datetime.strptime(userprofile.birthdate, "%d %b %Y")
        birthdate = datetime.strftime(birthdate, "%Y-%m-%d")
        user = User.objects.get(pk=userprofile.user)
        profile_exists = False
        attempt = 1
        while attempt <= 5:
            try:
                new_profile = UserProfile.objects.get(
                    full_name__iexact=userprofile.full_name,
                    town_or_city__iexact=userprofile.town_or_city,
                    country__iexact=userprofile.country,
                    gender__iexact=userprofile.gender,
                    weight__iexact=userprofile.weight,
                    birthdate__iexact=birthdate,
                    user=user,
                    stripe_pid__iexact=pid
                )
                profile_exists = True
                break
            except UserProfile.DoesNotExist:
                attempt += 1
                time.sleep(1)
        if profile_exists:
            # self._send_confirmation_email(order)
            return HttpResponse(
                    content=f'Webhook received: {event["type"]} | Success: Verified profile already in database',
                    status=200)
        else:
            new_profile = None
            try:
                new_profile = UserProfile.objects.create(
                    full_name=userprofile.full_name,
                    town_or_city=userprofile.town_or_city,
                    country=userprofile.country,
                    gender=userprofile.gender,
                    weight=userprofile.weight,
                    birthdate=birthdate,
                    user=user,
                    stripe_pid=pid
                )
                new_profile.image = 'media/noprofpic.jpg'
                new_profile.save()
                createDefaultHeroLevels(user)
            except Exception as e:
                if new_profile:
                    new_profile.delete()
                return HttpResponse(
                    content=f'Webhook received: {event["type"]} | ERROR: {e}',
                    status=500)
        # self._send_confirmation_email(order)
        print("WEBHOOK PAYMENT SUCCEEDED")
        return HttpResponse(
            content=f'Webhook received: {event["type"]} |  SUCCESS: created profile in webhook',
            status=200)

    def handle_payment_intent_payment_failed(self, event):
        """
        Handle the payment_intent.payment_failed webhook from Stripe
        """
        print("FAILED WEBHOOK PAYMENT")
        return HttpResponse(
            content=f'Webhook received: {event["type"]}',
            status=200)
