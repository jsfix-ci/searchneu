import { DropdownItemProps } from 'semantic-ui-react';
import { Campus } from './types';

export const neuTermDropdownOptions: DropdownItemProps[] = [
    {
      text: 'Spring 2021',
      value: '202130',
    },
    {
      text: 'Fall 2020',
      value: '202110',
    },
    {
      text: 'Summer I 2020',
      value: '202040',
    },
    {
      text: 'Summer Full 2020',
      value: '202050',
    },
    {
      text: 'Summer II 2020',
      value: '202060',
    },
    {
      text: 'Spring 2020',
      value: '202030',
    },
  ];
  
  export const cpsTermDropdownOptions: DropdownItemProps[] = [
    {
      text: 'Spring Semester 2021',
      value: '202134',
    },
    {
      text: 'Spring Quarter 2021',
      value: '202135',
    },
    {
      text: 'Winter Quarter 2020',
      value: '202125',
    },
    {
      text: 'Fall Semester 2020',
      value: '202114',
    },
    {
      text: 'Fall Quarter 2020',
      value: '202115',
    },
    {
      text: 'Summer Semester 2020',
      value: '202054',
    },
    {
      text: 'Summer Quarter 2020',
      value: '202055',
    },
    {
      text: 'Spring Semester 2020',
      value: '202034',
    },
    {
      text: 'Spring Quarter 2020',
      value: '202034',
    },
  ];
  
  export const lawTermDropdownOptions: DropdownItemProps[] = [
    {
      text: 'Spring Semester 2021',
      value: '202132',
    },
    {
      text: 'Spring Quarter 2021',
      value: '202138',
    },
    {
      text: 'Winter Quarter 2020',
      value: '202128',
    },
    {
      text: 'Fall Semester 2020',
      value: '202112',
    },
    {
      text: 'Fall Quarter 2020',
      value: '202118',
    },
    {
      text: 'Summer Semester 2020',
      value: '202052',
    },
    {
      text: 'Summer Quarter 2020',
      value: '202058',
    },
    {
      text: 'Spring Semester 2020',
      value: '202032',
    },
    {
      text: 'Spring Quarter 2020',
      value: '202038',
    },
  ];
  
  export const campusDropdownOptions: DropdownItemProps[] = [
    {
      text: 'NEU',
      value: 'NEU',
    },
    {
      text: 'CPS',
      value: 'CPS',
    },
    {
      text: 'Law',
      value: 'LAW',
    },
  ];

  export function getAllCampusDropdownOptions(): DropdownItemProps[] {
    return campusDropdownOptions;
  }

  export function getTermDropdownOptionsForCampus(c: Campus): DropdownItemProps[] {
    switch(c) {
      case Campus.NEU:
        return neuTermDropdownOptions;
      case Campus.CPS:
        return cpsTermDropdownOptions;
      case Campus.LAW:
        return lawTermDropdownOptions;
      default:
        return [];
    }
  }

  export function getLatestTerm(c: Campus): string {
    switch(c) {
      case Campus.NEU:
        return neuTermDropdownOptions[0].value as string;
      case Campus.CPS:
        return cpsTermDropdownOptions[0].value as string;
      case Campus.LAW:
        return lawTermDropdownOptions[0].value as string;
      default:
        return "";
    }
  }

  export function getCampusByLastDigit(t: string): Campus {
    switch(t) {
      case "0":
        return Campus.NEU;
      case "2":
      case "8":
        return Campus.LAW;
      case "4":
      case "5":
        return Campus.CPS;
    }
  }

  
