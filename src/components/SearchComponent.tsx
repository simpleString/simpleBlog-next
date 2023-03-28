import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import Datepicker from "react-tailwindcss-datepicker";
import { useOrderSearchPostsStore } from "../store";
import Dropdown from "./Dropdown";

type SearchComponentProps = {
  query: string;
  resultCount: number;
  submitFn: ({
    author,
    dateFrom,
    dateTo,
    ratingFrom,
    ratingTo,
  }: FormInputType) => void;
};

export type FormInputType = {
  author: string;
  ratingFrom: number;
  ratingTo: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

const resolver: Resolver<FormInputType> = async (data) => {
  console.log("Resolve data: " + data);

  if (data.ratingTo && data.ratingFrom && data.ratingTo < data.ratingFrom) {
    return {
      values: {},
      errors: {
        ratingTo: {
          type: "value",
          message: "Rating to must be low that rating from",
        },
      },
    };
  }
  if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
    return {
      values: {},
      errors: {
        dateTo: {
          type: "value",
          message: "Date must be low that date from",
        },
      },
    };
  }
  return {
    values: {
      ...data,
      ratingTo: isNaN(data.ratingTo) ? undefined : data.ratingTo,
      ratingFrom: isNaN(data.ratingFrom) ? undefined : data.ratingFrom,
      dateFrom:
        data.dateFrom && isNaN(data.dateFrom.getUTCMilliseconds())
          ? undefined
          : data.dateFrom,
      dateTo:
        data.dateTo && isNaN(data.dateTo.getUTCMilliseconds())
          ? undefined
          : data.dateTo,
    },
    errors: {},
  };
};

const SearchComponent: React.FC<SearchComponentProps> = ({
  query,
  resultCount,
  submitFn,
}) => {
  const { order, changeOrder } = useOrderSearchPostsStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
  } = useForm<FormInputType>({
    resolver,
    mode: "all",
  });

  const currentRatingFromValue = watch("ratingFrom");

  useEffect(() => {
    if (!getValues("ratingTo")) return;
    setValue("ratingTo", getValues("ratingTo"), {
      shouldValidate: true,
    });
  }, [currentRatingFromValue, getValues, setValue]);

  const onSubmit = handleSubmit((data) => {
    submitFn(data);
  });

  useEffect(() => {
    register("dateFrom");
    register("dateTo");
  }, [register]);

  const fromDateValue = {
    startDate: watch("dateFrom") ?? null,
    endDate: watch("dateFrom") ?? null,
  };

  const toDateValue = {
    startDate: watch("dateTo") ?? null,
    endDate: watch("dateTo") ?? null,
  };

  return (
    <div className="bg-base-200">
      <div className="flex flex-col space-y-4 p-4">
        <div className="flex flex-col">
          <span className="text-5xl font-semibold">{query}</span>
          <span className="text-xl ">Result count: {resultCount}</span>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col space-y-2">
          <div className="flex">
            <label>
              <span>Author</span>
              <input
                {...register("author")}
                className="input-bordered input w-full"
                placeholder="Name"
              />
            </label>
            <label>
              <input type="checkbox" className="toggle" checked />
            </label>
          </div>

          <span>Rating</span>
          <label className="flex items-center space-x-2">
            <input
              {...register("ratingFrom", { valueAsNumber: true })}
              type="number"
              className="input-bordered input w-full"
              placeholder="From"
            />
            <input
              {...register("ratingTo", { valueAsNumber: true })}
              type="number"
              className={`input-bordered input w-full ${
                errors.ratingTo ? "input-error" : ""
              }`}
              placeholder="To"
            />
          </label>
          {errors.ratingTo && <p>{errors.ratingTo.message}</p>}

          <span>Date</span>
          <div className="flex items-center justify-center space-x-2">
            <Datepicker
              placeholder="From"
              useRange={false}
              asSingle={true}
              maxDate={getValues("dateTo")}
              inputClassName={`input-bordered input w-full text-base font-normal`}
              value={fromDateValue}
              onChange={(value) =>
                setValue(
                  "dateFrom",
                  new Date(value?.startDate?.toLocaleString() || "")
                )
              }
            />

            <Datepicker
              placeholder="To"
              minDate={getValues("dateFrom")}
              inputClassName={`input-bordered input w-full text-base font-normal`}
              useRange={false}
              asSingle={true}
              value={toDateValue}
              onChange={(value) =>
                setValue(
                  "dateTo",
                  new Date(value?.startDate?.toLocaleString() || "")
                )
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn" type="submit">
              Search
            </button>
            <button className="btn" onClick={() => reset()}>
              Reset
            </button>
          </div>
        </form>
        <div className="self-end">
          <Dropdown
            buttonComponentClasses="btn "
            childrenClasses="p-0 w-36 menu-compact"
            buttonComponent={<span>Sort by: {order}</span>}
            dropdownClasses="dropdown-end"
          >
            <li className="pt-2">
              <span
                className={`${order === "new" ? "active" : ""}`}
                onClick={() => changeOrder("new")}
              >
                New
              </span>
            </li>
            <li>
              <span
                className={`${order === "best" ? "active" : ""}`}
                onClick={() => changeOrder("best")}
              >
                Best
              </span>
            </li>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
