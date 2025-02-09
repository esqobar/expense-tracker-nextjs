'use server'

import {auth} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";

interface TransactionData {
    text: string
    amount: number
}

interface TransactionResult {
    data?: TransactionData
    error?: string
}

async function addTransaction(formData: FormData): Promise<TransactionResult> {
    const textValue = formData.get('text')
    const amountValue = formData.get('amount')

    //checking for input values
    if (!textValue || textValue === '' || !amountValue) {
        return { error: 'Text or amount is missing' }
    }

    //ensuring text is a String
    const text: string = textValue.toString()
    //parse amount as number
    const amount: number = parseFloat(amountValue.toString())

    //getting a loggedin user
    const { userId } = auth()

    //checking for a user
    if (!userId) {
        return { error: 'User not found'}
    }

    try {
        const transactionData: TransactionData = await db.transaction.create({
            data: {
                text, amount, userId
            },
        });
        revalidatePath('/')

        return { data: transactionData }
    } catch (error) {
        return { error: 'Transaction not added'}
    }

    
}

export default addTransaction