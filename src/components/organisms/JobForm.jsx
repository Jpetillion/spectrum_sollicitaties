import { useState } from 'react';
import FormRow from '../molecules/FormRow.jsx';
import Input from '../atoms/Input.jsx';
import Textarea from '../atoms/Textarea.jsx';
import Button from '../atoms/Button.jsx';

export default function JobForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    vak: initialData.vak || '',
    hours: initialData.hours || '',
    classes: initialData.classes || '',
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Titel is verplicht';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <FormRow label="Titel" htmlFor="title" required error={errors.title}>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="bijv. Leraar Wiskunde"
        />
      </FormRow>

      <FormRow label="Vak" htmlFor="vak">
        <Input
          id="vak"
          name="vak"
          value={formData.vak}
          onChange={handleChange}
          placeholder="bijv. Wiskunde, Nederlands"
        />
      </FormRow>

      <FormRow label="Aantal uren" htmlFor="hours">
        <Input
          id="hours"
          name="hours"
          type="number"
          step="0.5"
          value={formData.hours}
          onChange={handleChange}
          placeholder="bijv. 20"
        />
      </FormRow>

      <FormRow label="Klassen" htmlFor="classes">
        <Input
          id="classes"
          name="classes"
          value={formData.classes}
          onChange={handleChange}
          placeholder="bijv. 5e-6e jaar"
        />
      </FormRow>

      <FormRow label="Opmerkingen" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Extra informatie over de vacature"
          rows={4}
        />
      </FormRow>

      <div className="form-actions">
        <Button type="submit" variant="primary">Opslaan</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuleren
          </Button>
        )}
      </div>
    </form>
  );
}
