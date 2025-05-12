"use client";

import dynamic from 'next/dynamic';
import type { CreatableProps } from 'react-select/creatable';
import type { GroupBase } from 'react-select';
import type { OptionType } from "@/lib/types";

// Dynamically import CreatableSelect with no SSR
const CreatableSelectComponent = dynamic(
  () => import('react-select/creatable').then(mod => mod.default),
  { ssr: false }
);

export function ClientCreatableSelect(props: CreatableProps<OptionType, boolean, GroupBase<OptionType>>) {
  return <CreatableSelectComponent {...props} />;
} 