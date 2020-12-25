from django import forms
from .models import Log


class LogForm(forms.ModelForm):
    class Meta:
        model = Log
        fields = (
            'ft_result',
            'amrap_result',
            'mw_result',
            'rx',
            'user_comment'
            )

    def __init__(self, *args, **kwargs):
        """
        Add placeholders and classes, remove auto-generated
        labels and set autofocus on first field
        """
        super().__init__(*args, **kwargs)
        placeholders = {
            'ft_result': 'mm:ss',
            'amrap_result': '0.00 rounds',
            'mw_result': 'weight in kg',
            'user_comment': 'notes?'
        }

        for field in self.fields:
            if not field == 'rx':
                placeholder = placeholders[field]
                self.fields[field].widget.attrs['placeholder'] = placeholder
            self.fields[field].widget.attrs['class'] = 'border-black rounded-0 profile-form-input'
            self.fields[field].label = False
