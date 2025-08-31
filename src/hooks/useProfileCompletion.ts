import { useMemo } from "react";
import { Profile } from "@/hooks/useProfile";

interface ProfileCheckItem {
  label: string;
  completed: boolean;
  key: string;
}

interface ProfileCompletion {
  items: ProfileCheckItem[];
  completionPercentage: number;
  isComplete: boolean;
}

export function useProfileCompletion(profile: Profile | null): ProfileCompletion {
  return useMemo(() => {
    if (!profile) {
      return {
        items: [
          { label: "Name", completed: false, key: "name" },
          { label: "Academic Level", completed: false, key: "academic_level" },
          { label: "Subjects of Interest", completed: false, key: "interests" },
          { label: "Study Goals", completed: false, key: "study_goals" },
        ],
        completionPercentage: 0,
        isComplete: false,
      };
    }

    const items: ProfileCheckItem[] = [
      {
        label: "Name",
        completed: Boolean(profile.name?.trim()),
        key: "name",
      },
      {
        label: "Academic Level",
        completed: Boolean(profile.academic_level?.trim()),
        key: "academic_level",
      },
      {
        label: "Subjects of Interest",
        completed: Boolean(profile.interests && profile.interests.length > 0),
        key: "interests",
      },
      {
        label: "Study Goals",
        completed: Boolean(profile.study_goals && profile.study_goals.length > 0),
        key: "study_goals",
      },
    ];

    const completedCount = items.filter(item => item.completed).length;
    const completionPercentage = Math.round((completedCount / items.length) * 100);
    const isComplete = completionPercentage === 100;

    return {
      items,
      completionPercentage,
      isComplete,
    };
  }, [profile]);
}