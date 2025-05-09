import { WEBSITE_URL } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ipcMain } from "../lib/ipc";
import { licenseKeySearchParam } from "../lib/search-params";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export const licenseKeySchema = z.object({
	licenseKey: z.string(),
});

function LicenseKeyForm({
	onSubmit,
}: {
	onSubmit: (key: z.infer<typeof licenseKeySchema>["licenseKey"]) => void;
}) {
	const form = useForm<z.infer<typeof licenseKeySchema>>({
		resolver: zodResolver(licenseKeySchema),
		defaultValues: {
			licenseKey: "",
		},
	});

	return (
		<Form {...form}>
			<form
				className="space-y-4"
				onSubmit={form.handleSubmit(({ licenseKey }) => {
					onSubmit(licenseKey);
				})}
			>
				<FormField
					control={form.control}
					name="licenseKey"
					render={({ field }) => (
						<FormItem>
							<FormLabel>License Key</FormLabel>
							<FormControl>
								<Input
									placeholder="5b03075b-9c65-4656-8ca3-f09af0d4267a"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex justify-end items-center">
					<Button type="submit" className="self-end">
						Activate
					</Button>
				</div>
			</form>
		</Form>
	);
}

function ActivateLicenseKeyButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Activate</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Activate License Key</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					Please enter the license key you received at your email address after
					your purchase.
				</DialogDescription>
				<LicenseKeyForm
					onSubmit={async (licenseKey) => {
						const { success } = await ipcMain.invoke(
							"activateLicenseKey",
							licenseKey,
						);

						if (success) {
							setIsOpen(false);
						}
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

export function LicenseKey() {
	const [licenseKey, setLicenseKey] = useState<string | null>(null);

	useEffect(() => {
		if (licenseKeySearchParam) {
			setLicenseKey(JSON.parse(licenseKeySearchParam));
		}
	}, []);

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<div className="text-3xl font-bold tracking-tight">License</div>
			</div>
			{licenseKey ? (
				<>
					<div className="mb-4">
						You're using the Pro version of Meru for professional and commercial
						use.
					</div>
					<div className="flex justify-end">
						<Button
							variant="outline"
							onClick={() => {
								navigator.clipboard.writeText(licenseKey);
							}}
						>
							Copy License Key
						</Button>
					</div>
				</>
			) : (
				<>
					<div className="mb-2">
						You're using the free version of Meru for personal use.
					</div>
					<div className="mb-4">
						Upgrade to start using Meru at its fullest for professional and
						commercial use.
					</div>
					<div className="flex gap-4 justify-end">
						<ActivateLicenseKeyButton />
						<Button asChild>
							<a href={WEBSITE_URL} target="_blank" rel="noreferrer">
								Upgrade
							</a>
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
