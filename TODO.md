# ESLint Fix Plan - 121 Issues

## Critical Issues (Must Fix First)

### 1. Parsing Errors - Git Merge Conflicts
- [ ] **GuideDetail.jsx** (line 634): Remove git merge conflict markers `<<<<<<< HEAD`, `=======`, `>>>>>>> sagar`
- [ ] **GuidePost.jsx** (line 52): Remove git merge conflict markers

### 2. Node.js Specific Issues
- [ ] **server.js**: Fix `Buffer` is not defined - Add Node.js globals or import Buffer
- [ ] **tailwindcss.config.js**: Fix `require` is not defined - Update to ES modules or add globals

## High Priority Issues

### 3. Unused Variables & Imports (50+ files affected)
- [ ] Remove unused imports and variables across all files
- [ ] Focus on: motion, useMemo, useScroll, useTransform, colors, fadeInLeft, fadeInRight, scaleIn, formatCount, etc.

### 4. React Hook Dependencies
- [ ] Fix missing dependencies in useEffect hooks
- [ ] Add proper dependency arrays or useCallback for functions
- [ ] Target files: GuideEdit.jsx, Profile.jsx, GuidePost.jsx, various component files

### 5. Switch Case Issues
- [ ] Add missing `break` statements in PaymentCheckout.jsx switch cases
- [ ] Fix lexical declarations in case blocks for EventPost.jsx, EventUpdate.jsx, etc.

## Medium Priority Issues

### 6. React Refresh Issues
- [ ] Refactor files that export non-components to separate files
- [ ] Files: RichTextEditor.jsx, AuthContext.jsx, MyListings.jsx

### 7. Undefined Variables
- [ ] Fix `navigationLink` not defined in Profile.jsx
- [ ] Add proper imports or define missing variables

## Low Priority Issues

### 8. Naming Convention Issues
- [ ] Variables starting with lowercase that should follow UPPER_CASE convention
- [ ] Fix ESLint allowed unused vars pattern matching

## Implementation Strategy

1. **Phase 1**: Fix critical parsing errors first
2. **Phase 2**: Fix Node.js specific issues
3. **Phase 3**: Batch fix unused variables/imports
4. **Phase 4**: Fix React hook dependencies
5. **Phase 5**: Fix switch case and control flow issues
6. **Phase 6**: Handle React refresh and undefined variable issues
7. **Phase 7**: Final cleanup and validation

## Files to Focus On

### Most Critical:
- GuideDetail.jsx
- GuidePost.jsx  
- server.js
- tailwindcss.config.js

### High Impact:
- Home.jsx (20+ issues)
- Profile.jsx (15+ issues)
- Connect.jsx (10+ issues)
- PaymentCheckout.jsx (5+ switch case errors)

### Medium Impact:
- All guide-related files
- All component files
- All auth-related files

## Expected Outcome
- 0 parsing errors
- 0 undefined variable errors  
- Significantly reduced unused variable warnings
- Proper React hook dependency management
- Clean switch case implementations
- Improved code quality and maintainability
