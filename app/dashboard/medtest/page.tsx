"use client";

import { CustomButton, Header1, HeaderControls, inputSelectStyle, inputTextStyle } from "@/components/BasicComponents";
import { shadowFrozen, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRowOddEven } from "@/components/TableComponents";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { addMedTest, getMedTests, MedTest, removeMedTest, updateMedTest } from "./actions";
import EditableField from "@/components/EditableField";
import { getUOMs, UOM } from "../uom/actions";
import { addTestCtg, getTestCtgs, TestCtg } from "../testctg/actions";
import ConfirmModal from "@/components/ConfirmModal";

export default function Page() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    useEffect(() => {
        if (!isPending && !session) {
            router.push("/");
        }
    }, [session, isPending, router]);

    const [medTests, setMedTests] = useState<MedTest[]>([]);
    const selects = useRef<MedTest[]>([]);
    const [selectSize, setSelectSize] = useState(0);

    const [uoms, setUoms] = useState<UOM[]>([]);
    const [ctgs, setCtgs] = useState<TestCtg[]>([]);

    const [isLoading, setLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);

    // Read
    const fetchDatabase = useCallback(() => {
        setLoading(true);

        const fetchTestPromise = getMedTests()
            .then((medTests) => {
                setMedTests(medTests);
                selects.current = [];
                setSelectSize(0);
            });

        const fetchUomPromise = getUOMs().then(setUoms);
        const fetchCtgPromise = getTestCtgs().then(setCtgs);
        
        Promise.all([fetchTestPromise, fetchUomPromise, fetchCtgPromise])
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    useEffect(() => {
        if (session) fetchDatabase();
    }, [fetchDatabase, session])

    // Update
    const medTestChanged = (medTest: MedTest) => {
        let newarr = [...medTests];
        const changedIndex = newarr.findIndex(i => i.id === medTest.id);
        newarr[changedIndex] = {...medTest};
        setMedTests(newarr);

        setSaving(true);
        updateMedTest(medTest).then(() => setSaving(false));
    }

    // Delete
    const medTestDeleted = (deletes: MedTest[]) => {
        setMedTests(medTests.filter(i => !deletes.includes(i)));

        setSaving(true);
        removeMedTest(deletes).then(() => setSaving(false));
    }

    const DeletePanel = () => {
        const onClick = () => {
            const message = `This will delete ${selectSize} ${selectSize >= 2 ? "rows" : "row"}. Do you wish to continue?`

            ConfirmModal(message).then((yes) => {
                if (yes) medTestDeleted(selects.current);
            })
        }
        
        return (
            <div className="flex items-center gap-3">
                <span>{selectSize} of {medTests.length} selected</span>
                <CustomButton onClick={onClick} disabled={selectSize < 1}> Delete </CustomButton>
            </div>
        )
    }

    const makeRow = (medTest: MedTest) => {
          const leftCells = `sticky z-10 bg-white font-medium text-gray-900 ${shadowFrozen} group-hover:bg-blue-50/50`;
        
        // Take out or add in selects when checked or unchecked.
        const onCheckBoxChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                selects.current.push(medTest);
            } else {
                selects.current = selects.current.filter(i => i.id !== medTest.id);
            }
            setSelectSize(selects.current.length);
        }

        return (
            <TableRowOddEven key={medTest.id}>
                <TableCell>
                    <input type="checkbox" onChange={onCheckBoxChange}></input>
                </TableCell>
                <TableCell className={`left-0 ${leftCells}`}> 
                    <EditableField value={medTest.name} onChange={s => medTestChanged({...medTest, name: s})}/> 
                </TableCell>
                <TableCell> 
                    <EditableField value={medTest.description} onChange={s => medTestChanged({...medTest, description: s})}/> 
                </TableCell>
                <TableCell>
                    {medTest.categoryname}
                </TableCell>
                <TableCell>
                    {medTest.uomname}
                </TableCell>
                <TableCell>
                    {medTest.normalmin}
                </TableCell>
                <TableCell>
                    {medTest.normalmax}
                </TableCell>
            </TableRowOddEven>
        )
    }

    const AddRow = () => {
        const nameRef = useRef<HTMLInputElement>(null);
        const descriptionRef = useRef<HTMLInputElement>(null);
        const categoryRef = useRef<HTMLSelectElement>(null);
        const unitRef = useRef<HTMLSelectElement>(null);
        const normalminRef = useRef<HTMLInputElement>(null);
        const normalmaxRef = useRef<HTMLInputElement>(null);

        // Updates the category state by adding in the new category, 
        const onAddBtnClick = () => {
            const newMedTest: MedTest = {
                id: medTests.reduce((a, b) => a.id > b.id ? a : b).id + 1,
                name: nameRef.current?.value ?? "", // TODO: Add check for empty unit
                description: descriptionRef.current?.value ?? "",
                iduom: +(unitRef.current?.value ?? 0),
                idcategory: +(categoryRef.current?.value ?? 0),
                normalmin: normalminRef.current?.valueAsNumber ?? 0,
                normalmax: normalmaxRef.current?.valueAsNumber ?? 0,
                uomname: uoms.find(i => i.id == unitRef.current?.value)?.name ?? "",
                categoryname: ctgs.find(i => i.id == categoryRef.current?.value)?.name ?? ""
            }

            setMedTests([...medTests, newMedTest]);

            setSaving(true)
            addMedTest(newMedTest).then(() => {
                setSaving(false);
                fetchDatabase();
            });
        }

        return (
            <TableRowOddEven>
                <TableCell>
                    <CustomButton onClick={onAddBtnClick} className="px-0 py-0">+ Add</CustomButton>
                </TableCell>
                <TableCell> 
                    <input ref={nameRef} type="text" className={inputTextStyle} placeholder="Test name..."></input>
                </TableCell>
                <TableCell>
                    <input ref={descriptionRef} type="text" className={inputTextStyle} placeholder="Description..."></input>
                </TableCell>
                <TableCell>
                    <select ref={categoryRef} className={inputSelectStyle}>
                        {ctgs.map(ctg =>
                         (<option key={ctg.id} value={ctg.id}> {ctg.name} </option>)   
                        )}
                    </select>
                </TableCell>
                <TableCell>
                    <select ref={unitRef} className={inputSelectStyle}>
                        {uoms.map(uom =>
                         (<option key={uom.id} value={uom.id}> {uom.name} </option>)   
                        )}
                    </select>
                </TableCell>
                <TableCell>
                    <input ref={normalminRef} type="number" className={inputTextStyle} placeholder="Min"></input>
                </TableCell>
                <TableCell>
                    <input ref={normalmaxRef} type="number" className={inputTextStyle} placeholder="Max"></input>
                </TableCell>
            </TableRowOddEven>
        )
    }

    return (
        <div className="space-y-4">
            <HeaderControls>
                <Header1>Medical Tests</Header1>
                <DeletePanel/>
            </HeaderControls>

            <Table>
                <TableHeader>
                    <tr>
                        <TableHeaderCell className={`sticky left-0 w-16 z-10`} > Actions </TableHeaderCell>
                        <TableHeaderCell className={`sticky left-16 w-xs z-10 ${shadowFrozen}`}> Test Name </TableHeaderCell>
                        <TableHeaderCell> Description </TableHeaderCell>
                        <TableHeaderCell> Category </TableHeaderCell>
                        <TableHeaderCell> Unit </TableHeaderCell>
                        <TableHeaderCell> Min </TableHeaderCell>
                        <TableHeaderCell> Max </TableHeaderCell>
                    </tr>
                </TableHeader>
                <TableBody>
                    {medTests.map(makeRow)}
                    <AddRow/>
                </TableBody>
            </Table>
        </div>
    )
}