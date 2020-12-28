import { useRouter } from 'next/router';
import React from 'react';
import macros from '../../macros';
import { CompositeReq, Course, CourseReq, PrereqType, Requisite } from '../../types';


export default function useResultDetail(aClass: Course) {
  const router = useRouter();
  const onReqClick = (reqType, childBranch, event, hash) => {
    router.push(hash);

    // Create the React element and add it to retVal
    const searchEvent = new CustomEvent(macros.searchEvent, { detail: `${childBranch.subject} ${childBranch.classId}` });
    window.dispatchEvent(searchEvent);
    event.preventDefault();

    // Rest of this function is analytics
    const classCode = `${childBranch.subject} ${childBranch.classId}`;
    let reqTypeString;

    switch (reqType) {
      case PrereqType.PREREQ:
        reqTypeString = 'Prerequisite';
        break;
      case PrereqType.COREQ:
        reqTypeString = 'Corequisite';
        break;
      case PrereqType.PREREQ_FOR:
        reqTypeString = 'Required Prerequisite For';
        break;
      case PrereqType.OPT_PREREQ_FOR:
        reqTypeString = 'Optional Prerequisite For';
        break;
      default:
        macros.error('unknown type.', reqType);
    }

    macros.logAmplitudeEvent('Requisite Click', {
      type: reqTypeString,
      subject: childBranch.subject,
      classId: childBranch.classId,
      classCode: classCode,
    });
  }

  // returns an array made to be rendered by react to display the prereqs
  const getReqsString = (reqType: PrereqType, course: Course) => {
    

    let childNodes: Requisite[];

    if (reqType === PrereqType.PREREQ) {
      childNodes = course.prereqs.values;
    } else if (reqType === PrereqType.COREQ) {
      childNodes = course.coreqs.values;
    } else if (reqType === PrereqType.PREREQ_FOR) {
      childNodes = course.prereqsFor.values;
    } else if (reqType === PrereqType.OPT_PREREQ_FOR) {
      childNodes = course.optPrereqsFor.values;
    } else {
      macros.error('Invalid prereqType', reqType);
    }

    return getReqsStringHelper(course, reqType, childNodes);  
  }

  const getReqsStringHelper = (course: Course, reqType: PrereqType, childNodes: Requisite[]) =>  {
    const retVal = [];

    // Keep track of which subject+classId combonations have been used so far.
    // If you encounter the same subject+classId combo in the same loop, skip the second one.
    // This is because there is no need to show (eg. CS 2500 and CS 2500 (hon)) in the same group
    // because only the subject and the classId are going to be shown.
    const processedSubjectClassIds = {};
    
    const isCompositeReq = (variableToCheck: any): variableToCheck is CompositeReq =>
    (variableToCheck as CompositeReq).type !== undefined;

    const isCourseReq = (variableToCheck: any): variableToCheck is CourseReq =>
      (variableToCheck as CourseReq).classId !== undefined;

    childNodes.forEach((childBranch) => {
      if (!isCourseReq(childBranch) && !isCompositeReq(childBranch)) {
        if (processedSubjectClassIds[childBranch]) {
          return;
        }
        processedSubjectClassIds[childBranch] = true;
        retVal.push(childBranch);
      } else if (isCourseReq(childBranch)) {
        // Skip if already seen
        if (processedSubjectClassIds[childBranch.subject + childBranch.classId]) {
          return;
        }
        processedSubjectClassIds[childBranch.subject + childBranch.classId] = true;

        // When adding support for right click-> open in new tab, we might also be able to fix the jsx-a11y/anchor-is-valid errors.
        // They are disabled for now.
        const hash = `/${aClass.termId}/${childBranch.subject}${childBranch.classId}`;

        const element = (
          <a
            role='link'
            key={ hash }
            tabIndex={ 0 }
            onClick={ (event) => { onReqClick(reqType, childBranch, event, hash); } }
          >
            {`${childBranch.subject} ${childBranch.classId}`}
          </a>
        );

        retVal.push(element);
      } else if (reqType === PrereqType.PREREQ && isCompositeReq(childBranch)) {
        console.log("asdfaskdfh")
        // Figure out how many unique classIds there are in the prereqs.
        const allClassIds = {};
        for (const node of childBranch.values) {
          if (isCourseReq(node))
            allClassIds[node.classId] = true;
        }

        // If there is only 1 prereq with a unique classId, don't show the parens.
        if (Object.keys(allClassIds).length === 1) {
          retVal.push(getReqsStringHelper(course, PrereqType.PREREQ, childBranch.values));
        } else {
          retVal.push(['(', getReqsStringHelper(course, PrereqType.PREREQ, childBranch.values), ')']);
        }
      } else {
        macros.error('Branch found and parsing coreqs?', childBranch);
      }
    })

    // Now insert the type divider ("and" vs "or") between the elements.
    // If we're parsing prereqsFor, we should use just a comma as a separator.
    // Can't use the join in case the objects are react elements
    if (reqType === PrereqType.PREREQ_FOR || reqType === PrereqType.OPT_PREREQ_FOR) {
      for (let i = retVal.length - 1; i >= 1; i--) {
        retVal.splice(i, 0, ', ');
      }
    } else {
      let type;
      if (reqType === PrereqType.PREREQ) {
        type = course.prereqs.type;
      } else if (reqType === PrereqType.COREQ) {
        type = course.coreqs.type;
      }
      for (let i = retVal.length - 1; i >= 1; i--) {
        retVal.splice(i, 0, ` ${type} `);
      }
    }

    if (retVal.length === 0) {
      return (
        <span className='empty'>
          None
        </span>
      );
    }
    return retVal;
  }

  const optionalDisplay = (prereqType: PrereqType, course: Course) => {
    const data = getReqsString(prereqType, course);

    return data;
  }

  const creditsString = () => {
    const creditDescriptor = aClass.maxCredits > 1 || aClass.maxCredits === 0 ? 'CREDITS' : 'CREDIT'
    return aClass.maxCredits === aClass.minCredits ? `${aClass.maxCredits} ${creditDescriptor}` : `${aClass.maxCredits}-${aClass.maxCredits} ${creditDescriptor}`
  }


  return {
    optionalDisplay,
    creditsString,
  }
}
