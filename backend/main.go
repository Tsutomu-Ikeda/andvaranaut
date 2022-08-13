package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Event struct {
	Name      string `json:"name"`
	EventType string `json:"type"`
	Fare      int    `json:"fare,omitempty"`
	Amounts   int    `json:"amounts,omitempty"`
}

type DateEvent struct {
	Date       time.Time `json:"date"`
	Event      []Event   `json:"events"`
	WorkingDay bool      `json:"workingDay"`
}

type TransitInformation struct {
	UnitPrice    int       `json:"unitPrice"`
	LastModified time.Time `json:"lastModified"`
}

func dateEventsHandler(w http.ResponseWriter, r *http.Request) {
	bytes, err := os.ReadFile("data/2022-07-26.json")
	if err != nil {
		panic(err.Error())
	}
	var dateEvents []DateEvent
	if err := json.Unmarshal(bytes, &dateEvents); err != nil {
		panic(err.Error())
	}
	js, err := json.Marshal(dateEvents)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(js)
}

func transitInformationHandler(w http.ResponseWriter, r *http.Request) {
	bytes, err := os.ReadFile("data/transitInformation.json")
	if err != nil {
		panic(err.Error())
	}
	var transitInformation TransitInformation
	if err := json.Unmarshal(bytes, &transitInformation); err != nil {
		panic(err.Error())
	}
	js, err := json.Marshal(transitInformation)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(js)
}

func main() {
	http.HandleFunc("/api/date_events", dateEventsHandler)
	http.HandleFunc("/api/transit_information", transitInformationHandler)
	fmt.Println("listening: http://localhost:8000")
	http.ListenAndServe("127.0.0.1:8000", nil)
}
