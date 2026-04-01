import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getOwnProfileApi,
  updatePersonalApi,
  getAddressesApi,
  upsertAddressApi,
  deleteAddressApi,
} from "../../../api/faculty.api";

const personalSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  nationality: z.string().optional(),
  category: z.string().optional(),
  dob: z.string().optional(),
  orcidId: z.string().optional(),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  line3: z.string().optional(),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pin: z.string().min(1, "PIN is required"),
});

type PersonalForm = z.infer<typeof personalSchema>;
type AddressForm = z.infer<typeof addressSchema>;

interface Address {
  id: number;
  type: "CORRESPONDENCE" | "PERMANENT";
  line1: string;
  line2?: string;
  line3?: string;
  district: string;
  state: string;
  country: string;
  pin: string;
}

// ── Address Form Section ─────────────────────────────────

function AddressFormSection({
  type,
  existing,
  correspondenceAddress,
  onSaved,
}: {
  type: "CORRESPONDENCE" | "PERMANENT";
  existing?: Address;
  correspondenceAddress?: Address;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  // pre-fill form when existing address changes
  useEffect(() => {
    if (existing) {
      reset({
        line1: existing.line1,
        line2: existing.line2 ?? "",
        line3: existing.line3 ?? "",
        district: existing.district,
        state: existing.state,
        country: existing.country,
        pin: existing.pin,
      });
    } else {
      reset({
        line1: "",
        line2: "",
        line3: "",
        district: "",
        state: "",
        country: "India",
        pin: "",
      });
    }
  }, [existing, reset]);

  // reset sameAsCorrespondence when form closes
  useEffect(() => {
    if (!showForm) setSameAsCorrespondence(false);
  }, [showForm]);

  const handleSameAsCorrespondence = (checked: boolean) => {
    setSameAsCorrespondence(checked);
    if (checked && correspondenceAddress) {
      setValue("line1", correspondenceAddress.line1);
      setValue("line2", correspondenceAddress.line2 ?? "");
      setValue("line3", correspondenceAddress.line3 ?? "");
      setValue("district", correspondenceAddress.district);
      setValue("state", correspondenceAddress.state);
      setValue("country", correspondenceAddress.country);
      setValue("pin", correspondenceAddress.pin);
    } else if (!checked) {
      // restore existing or clear
      if (existing) {
        reset({
          line1: existing.line1,
          line2: existing.line2 ?? "",
          line3: existing.line3 ?? "",
          district: existing.district,
          state: existing.state,
          country: existing.country,
          pin: existing.pin,
        });
      } else {
        reset({
          line1: "",
          line2: "",
          line3: "",
          district: "",
          state: "",
          country: "India",
          pin: "",
        });
      }
    }
  };

  const onSubmit = async (data: AddressForm) => {
    try {
      setSaving(true);
      setServerError("");
      await upsertAddressApi(type, data);
      setSuccess(true);
      setShowForm(false);
      onSaved();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${type.toLowerCase()} address?`)) return;
    try {
      setDeleting(true);
      await deleteAddressApi(type);
      onSaved();
    } finally {
      setDeleting(false);
    }
  };

  const label =
    type === "CORRESPONDENCE" ? "Correspondence Address" : "Permanent Address";
  const icon = type === "CORRESPONDENCE" ? "📬" : "🏠";
  const isDisabled = sameAsCorrespondence;

  return (
    <div className="border border-gray-100 rounded-xl p-4">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {icon} {label}
        </h3>
        <div className="flex gap-2">
          {existing && !showForm && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-500 hover:underline disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-blue-600 hover:underline"
          >
            {showForm ? "Cancel" : existing ? "Edit" : "+ Add"}
          </button>
        </div>
      </div>

      {/* display existing address (read mode) */}
      {existing && !showForm && (
        <div className="text-sm text-gray-600 space-y-0.5">
          <p>{existing.line1}</p>
          {existing.line2 && <p>{existing.line2}</p>}
          {existing.line3 && <p>{existing.line3}</p>}
          <p>
            {existing.district}, {existing.state} — {existing.pin}
          </p>
          <p>{existing.country}</p>
        </div>
      )}

      {/* empty state */}
      {!existing && !showForm && (
        <p className="text-xs text-gray-400">No address added yet.</p>
      )}

      {/* success message outside form */}
      {success && !showForm && (
        <p className="text-green-600 text-xs mt-2">
          Address saved successfully.
        </p>
      )}

      {/* form */}
      {showForm && (
        <div className="mt-3 space-y-3">
          {/* same as correspondence — only for PERMANENT */}
          {type === "PERMANENT" && (
            <>
              {correspondenceAddress ? (
                <label className="flex items-center gap-2 cursor-pointer select-none bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={sameAsCorrespondence}
                    onChange={(e) =>
                      handleSameAsCorrespondence(e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                  />
                  <span className="text-sm text-blue-700 font-medium">
                    Same as Correspondence Address
                  </span>
                </label>
              ) : (
                <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                  Add your correspondence address first to use the "same as"
                  option.
                </div>
              )}
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* line 1 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  {...register("line1")}
                  placeholder="House/Flat No., Street"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {errors.line1 && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.line1.message}
                  </p>
                )}
              </div>

              {/* line 2 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  {...register("line2")}
                  placeholder="Area, Locality"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* line 3 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address Line 3
                </label>
                <input
                  {...register("line3")}
                  placeholder="Landmark (optional)"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* district */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  {...register("district")}
                  placeholder="e.g. Bhopal"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {errors.district && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* state */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  {...register("state")}
                  placeholder="e.g. Madhya Pradesh"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.state.message}
                  </p>
                )}
              </div>

              {/* country */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  {...register("country")}
                  placeholder="e.g. India"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* pin */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <input
                  {...register("pin")}
                  placeholder="e.g. 462003"
                  disabled={isDisabled}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                {errors.pin && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.pin.message}
                  </p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Main Tab ─────────────────────────────────────────────

export default function PersonalInfoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalForm>({ resolver: zodResolver(personalSchema) });

  const fetchAddresses = async () => {
    const res = await getAddressesApi();
    setAddresses(res.data);
  };

  useEffect(() => {
    Promise.all([getOwnProfileApi(), getAddressesApi()])
      .then(([profileRes, addressRes]) => {
        const f = profileRes.data;
        reset({
          name: f.name ?? "",
          mobile: f.mobile ?? "",
          gender: f.gender ?? undefined,
          nationality: f.nationality ?? "",
          category: f.category ?? "",
          dob: f.dob ? f.dob.split("T")[0] : "",
          orcidId: f.orcidId ?? "",
          photoUrl: f.photoUrl ?? "",
        });
        setAddresses(addressRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: PersonalForm) => {
    try {
      setSaving(true);
      setServerError("");
      setSuccess(false);
      await updatePersonalApi(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const correspondenceAddress = addresses.find(
    (a) => a.type === "CORRESPONDENCE",
  );
  const permanentAddress = addresses.find((a) => a.type === "PERMANENT");

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* personal info form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                {...register("mobile")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                {...register("dob")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                {...register("nationality")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">Select category</option>
                <option value="GENERAL">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ORCID ID
              </label>
              <input
                {...register("orcidId")}
                placeholder="0000-0000-0000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo URL
              </label>
              <input
                {...register("photoUrl")}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.photoUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.photoUrl.message}
                </p>
              )}
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
              Personal information saved successfully.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* address section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Addresses
        </h2>
        <div className="space-y-4">
          <AddressFormSection
            type="CORRESPONDENCE"
            existing={correspondenceAddress}
            onSaved={fetchAddresses}
          />
          <AddressFormSection
            type="PERMANENT"
            existing={permanentAddress}
            correspondenceAddress={correspondenceAddress}
            onSaved={fetchAddresses}
          />
        </div>
      </div>
    </div>
  );
}
