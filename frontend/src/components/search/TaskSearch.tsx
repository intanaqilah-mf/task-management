import { TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

interface TaskSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export const TaskSearch = ({ onSearch, placeholder = 'Search tasks...', defaultValue = '' }: TaskSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(defaultValue);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <TextInput
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      leftSection={<IconSearch size={18} />}
      rightSection={
        searchQuery ? (
          <IconX
            size={18}
            style={{ cursor: 'pointer' }}
            onClick={handleClear}
          />
        ) : null
      }
      styles={{
        input: {
          borderRadius: '12px',
          paddingLeft: '2.5rem',
          paddingRight: searchQuery ? '2.5rem' : '1rem',
          border: '1px solid #e0e0e0',
          '&:focus': {
            borderColor: '#6C5DD3',
            boxShadow: '0 0 0 2px rgba(108, 93, 211, 0.1)',
          },
        },
      }}
    />
  );
};
