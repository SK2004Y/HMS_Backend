import { AppointmentModel } from "../modals/appointment.model";
import { AvailabilityModel } from "../modals/availability.model";

// utils/scheduleHelper.ts
export const autoReschedule = async (
  doctorId: string,
  date: string,
  preferredTime: string
) => {
  const availability = await AvailabilityModel.findOne({
    doctor: doctorId,
    availableDate: new Date(date),
  });

  if (!availability) return null;

  const bookedAppointments = await AppointmentModel.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: new Date(`${date}T00:00:00Z`),
      $lte: new Date(`${date}T23:59:59Z`),
    },
  });

  const bookedSlots = bookedAppointments.map((app) =>
    app.appointmentDate.toISOString().slice(11, 16)
  );

  const availableSlots = availability.timeSlots.filter(
    (slot: string) =>
      !bookedSlots.includes(slot) && !["13:00", "13:30", "14:00"].includes(slot)
  );

  const preferredIndex = availableSlots.indexOf(preferredTime);

  if (preferredIndex !== -1) return preferredTime;

  // Get the next best slot after the preferred time
  for (let slot of availableSlots) {
    if (slot > preferredTime) return slot;
  }

  // Try earlier slots
  for (let slot of availableSlots) {
    if (slot < preferredTime) return slot;
  }

  return null;
};
