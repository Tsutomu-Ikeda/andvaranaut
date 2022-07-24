package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"
)

type Event struct {
	Name      string `json:"name"`
	EventType string `json:"type"`
	Amounts   *int64 `json:"amounts"`
}

type DateEvent struct {
	Date  time.Time `json:"date"`
	Event []Event   `json:"events"`
}

type TransitInformation struct {
	UnitPrice    int64     `json:"unitPrice"`
	LastModified time.Time `json:"lastModified"`
}

func dateEventsHandler(w http.ResponseWriter, r *http.Request) {
	bytes, err := ioutil.ReadFile("data/2022-07-26.json")
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
	bytes, err := ioutil.ReadFile("data/transitInformation.json")
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
	http.HandleFunc("/api/dateEvents/", dateEventsHandler)
	http.HandleFunc("/api/transitInformation/", transitInformationHandler)
	http.ListenAndServe(":8000", nil)
}
