from django import forms
# from profiles.widgets import CustomClearableFileInput
from .models import CustomGroup


class CustomGroupForm(forms.ModelForm):
    class Meta:
        model = CustomGroup
        fields = ('name', 'share')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        placeholders = {
            'name': 'Group Name',
            # 'group_users': 'Group Members',
            'share': 'Share with group members'
        }

        self.fields['name'].widget.attrs['autofocus'] = True
        for field in self.fields:
            placeholder = placeholders[field]
            self.fields[field].widget.attrs['placeholder'] = placeholder
            self.fields[field].widget.attrs['class'] = 'border-black rounded-1 profile-form-input'
            if field == 'share':
                self.fields[field].label = self.fields[field].widget.attrs['placeholder']
            else:
                self.fields[field].label = False
