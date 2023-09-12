from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Offer

class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_companystaff", "is_staff", "is_superuser")
    fieldsets = (
        *UserAdmin.fieldsets,  # original form fieldsets, expanded
        (                      # new fieldset added on to the bottom
            'Company information',  # group heading of your choice; set to None for a blank space instead of a header
            {
                'fields': (
                    'is_companystaff',
                    'company_short_name',
                    'company_name',
                    'company_image',
                    'offers'
                ),
            },
        ),
    )

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ("full_name", "price")

admin.site.register(User, CustomUserAdmin)
# admin.site.register(Offer)