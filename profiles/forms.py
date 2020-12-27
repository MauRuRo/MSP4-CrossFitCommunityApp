from django import forms
from .models import User,  UserProfile
from django.core.exceptions import ValidationError


def validate_max(value):
    if value > 500:
        print("TESTVALIDATE")
        raise ValidationError(
            'This weight is too high.',
            code='invalid',
            params={'value': value},
        )


class UserProfileForm(forms.ModelForm):
    # weight = forms.DecimalField(validators=[validate_max])

    class Meta:
        model = UserProfile
        fields = ('full_name', 'town_or_city', 'country',
                  'gender', 'weight', 'image',)  # 'birthdate',

    # image = forms.ImageField(label='Image', required=False, widget=CustomClearableFileInput)


    def __init__(self, *args, **kwargs):
        """
        Add placeholders and classes, remove auto-generated
        labels and set autofocus on first field
        """
        super().__init__(*args, **kwargs)
        placeholders = {
            'full_name': 'Full Name',
            'town_or_city': 'Town or City',
            'gender': 'Gender',
            'weight': 'weight in kilograms',
            # 'birthdate': 'birthday'
        }

        self.fields['full_name'].widget.attrs['autofocus'] = True
        for field in self.fields:
            if field != 'country' and field != 'image':
                if self.fields[field].required:
                    placeholder = f'{placeholders[field]} *'
                else:
                    placeholder = placeholders[field]
                self.fields[field].widget.attrs['placeholder'] = placeholder
            self.fields[field].widget.attrs['class'] = 'border-black rounded-0 profile-form-input'
            self.fields[field].label = False
