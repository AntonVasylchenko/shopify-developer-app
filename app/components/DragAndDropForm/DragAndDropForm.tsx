import React from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

interface Field {
    id: string;
    label: string;
    placeholder: string;
    type: string;
    width: string;
}

interface DragProps {
    formFields: Field[],
    handlePosition: (e: Field[]) => void
    handleChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DragAndDropForm: React.FC<DragProps> = ({ formFields = [], handlePosition, handleChangeField }) => {
    const [fields, setFields] = React.useState<Field[]>(formFields);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        if (active?.id !== over?.id) {
            setFields((prevFields) => {
                const oldIndex = prevFields.findIndex((field) => field.id === active.id);
                const newIndex = prevFields.findIndex((field) => field.id === over.id);
                return arrayMove(prevFields, oldIndex, newIndex);
            });
        }



    };

    React.useEffect(() => {
        handlePosition(fields);
    }, [fields])

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
                <div>
                    {fields.map((field) => (
                        <SortableItem key={field.id} id={field.id} label={field.label} placeholder={field.placeholder} handleChangeField={handleChangeField} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DragAndDropForm;
