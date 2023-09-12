from django.db import models
from django.contrib.auth.models import AbstractUser

def company_offer_default():
    return {}

class User(AbstractUser):
    is_companystaff = models.BooleanField("Is company staff", blank=False, default=False, help_text="Is this user a staff from company?")
    company_short_name = models.CharField("Company short name (ID)", max_length=50, blank=True, help_text="Short name of company (to act as simple ID)")
    company_name = models.CharField("Company name", max_length=50, blank=True, help_text="Full name of company")
    company_image = models.TextField("Company image", max_length=500, blank=True, help_text="URL of company's image")
    offers = models.JSONField("Company offers", blank=True, default=company_offer_default, help_text="Current company offers in JSON format")

class Offer(models.Model):

    @property
    def full_name(self):
        return "%s (%s)"%(self.company.company_name, self.company.company_short_name)

    def __str__(self):
        return self.full_name

    company = models.ForeignKey(User, on_delete=models.CASCADE, help_text="Company that provides this offer")
    price = models.FloatField("Offer price", blank=True, help_text="Price of this offer")