import React, { ChangeEventHandler } from 'react';
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';

const EditModal: React.FC<{
    modalId: string, field: {
        label: string;
        placeholder?: string;
        required: boolean;
    }
}> = ({ modalId, field }) => {
    const shopify = useAppBridge();
    const [currentField, setCurrentField] = React.useState<{
        label: string;
        placeholder?: string;
        required: boolean;
    }>({
        ...field
    })


    function handleChangeField() {
        console.log(currentField);
        shopify.modal.hide(modalId)
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const { name, value } = input;
        console.log(name, value);

        if (name) {
            setCurrentField((prev) => ({ ...prev, [name]: value }))
        }
    };

    return (
        <>
            <Modal id={modalId}>
                <input type="text" name='label' onChange={handleChange} value={currentField.label} />
                <input type="text" name='placeholder' onChange={handleChange} value={currentField.placeholder} />
                <input type="checkbox" name='required' onChange={handleChange} value={currentField.required ? "true" : "false"} />
                <TitleBar title="Edit">
                    <button onClick={handleChangeField}>Save</button>
                </TitleBar>
            </Modal>
        </>
    );
}

export default EditModal