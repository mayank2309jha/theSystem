// The app's owner account — the only account allowed to see the 5 app-owned
// resume PDFs (Resume Maxing). Everyone else who signs up is a normal hunter
// with their own isolated data, but has no reason to see MAYANK's personal
// resumes — they'd use the public /try checker with their OWN resume instead.
export const OWNER_EMAIL = "mjzeus1729@gmail.com";

export function isOwner(user) {
  return user?.email === OWNER_EMAIL;
}
