import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ThemedButton from '../components/ThemedButton';
import { colors, fonts, radii, spacing } from '../theme';

const STORAGE_KEY = 'todoItems';

export default function ToDoScreen() {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (cancelled) return;

      if (stored) {
        try {
          setTasks(JSON.parse(stored));
        } catch {
          setTasks([]);
        }
      }
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistTasks = useCallback((nextTasks) => {
    setTasks(nextTasks);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
  }, []);

  function handleAddTask() {
    const text = newTaskText.trim();
    if (!text) return;

    const newTask = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, done: false };
    persistTasks([...tasks, newTask]);
    setNewTaskText('');
  }

  function handleToggleTask(id) {
    persistTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function handleDeleteTask(id) {
    persistTasks(tasks.filter((task) => task.id !== id));
  }

  if (!loaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          placeholderTextColor={colors.slateblue}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <ThemedButton title="Add" onPress={handleAddTask} variant="primary" />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one above.</Text>}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity style={styles.checkbox} onPress={() => handleToggleTask(item.id)} activeOpacity={0.7}>
              {item.done && <View style={styles.checkboxFill} />}
            </TouchableOpacity>

            <Text style={[styles.taskText, item.done && styles.taskTextDone]} numberOfLines={3}>
              {item.text}
            </Text>

            <ThemedButton
              title="✕"
              onPress={() => handleDeleteTask(item.id)}
              variant="danger"
              style={styles.deleteButton}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.slateblue,
    borderRadius: radii.sm,
    padding: spacing.md,
    marginRight: spacing.sm,
    backgroundColor: colors.paperDim,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.paperDim,
    borderLeftWidth: 4,
    borderLeftColor: colors.sage,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxFill: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.navy,
  },
  taskText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: colors.slateblue,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
