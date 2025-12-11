// Profile queries
export {
  profileKeys,
  useProfileQuery,
  usePublicProfilesQuery,
  useUpdateProfileMutation,
} from './useProfileQuery';

// Streak queries
export {
  streakKeys,
  useStreakQuery,
  useLeaderboardQuery,
  useUpdateStreakMutation,
  type UserStreak,
} from './useStreakQuery';

// Badge queries
export {
  badgeKeys,
  useBadgesQuery,
  useUserBadgesQuery,
  useAwardBadgeMutation,
  type Badge,
  type UserBadge,
} from './useBadgesQuery';

// Challenge queries
export {
  challengeKeys,
  useChallengesQuery,
  useUserChallengesQuery,
  useJoinChallengeMutation,
  useUpdateChallengeProgressMutation,
  type Challenge,
  type UserChallenge,
} from './useChallengesQuery';

// Activity feed queries
export {
  activityKeys,
  useActivityFeedQuery,
  usePostActivityMutation,
  type ActivityItem,
} from './useActivityFeedQuery';

// Onboarding queries
export {
  onboardingKeys,
  useOnboardingQuery,
  useUpdateOnboardingMutation,
  type OnboardingData,
} from './useOnboardingQuery';
